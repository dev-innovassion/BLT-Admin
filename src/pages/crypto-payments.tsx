import { useEffect, useMemo, useState } from "react";
import { useTabRefetch } from "@/hooks/useTabRefetch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cryptoApi, CryptoPaymentNetwork, CryptoPaymentAddress, CryptoPaymentTip } from "@/lib/backendCryptoPaymentsApi";

export default function CryptoPaymentsPage() {
  const { toast } = useToast();

  const [networks, setNetworks] = useState<CryptoPaymentNetwork[]>([]);
  const [addresses, setAddresses] = useState<CryptoPaymentAddress[]>([]);
  const [tips, setTips] = useState<CryptoPaymentTip[]>([]);

  const [loading, setLoading] = useState(false);

  const { activeTab, handleTabChange } = useTabRefetch("networks", [
    "crypto-networks",
    "crypto-addresses", 
    "crypto-tips"
  ]);

  const [openCreateNetwork, setOpenCreateNetwork] = useState(false);
  const [openEditNetworkId, setOpenEditNetworkId] = useState<string | null>(null);
  const [openCreateAddress, setOpenCreateAddress] = useState(false);
  const [openEditAddressId, setOpenEditAddressId] = useState<string | null>(null);
  const [openCreateTip, setOpenCreateTip] = useState(false);
  const [openEditTipId, setOpenEditTipId] = useState<string | null>(null);

  const [networkForm, setNetworkForm] = useState({ name: "", symbol: "", network: "", is_active: true, sort_order: 0 });
  const [addressForm, setAddressForm] = useState({ network_id: "", address: "", is_active: true });
  const [tipForm, setTipForm] = useState({ network_id: "", amount: "", currency: "USDT", is_active: true });

  const networkMap = useMemo(() => {
    const m: Record<string, CryptoPaymentNetwork> = {};
    networks.forEach((n) => (m[n.id] = n));
    return m;
  }, [networks]);

  async function loadAll() {
    setLoading(true);
    try {
      const [n, a, t] = await Promise.all([
        cryptoApi.getNetworks(),
        cryptoApi.getAddresses(),
        cryptoApi.getTips(),
      ]);
      if (n.success && n.data) setNetworks(n.data);
      if (a.success && a.data) setAddresses(a.data);
      if (t.success && t.data) setTips(t.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (activeTab) {
      loadAll();
    }
  }, [activeTab]);

  const handleCreateNetwork = async () => {
    const res = await cryptoApi.createNetwork({
      name: networkForm.name.trim(),
      symbol: networkForm.symbol.trim(),
      network: networkForm.network.trim(),
      is_active: networkForm.is_active,
      sort_order: Number(networkForm.sort_order) || 0,
    });
    if (!res.success) {
      toast({ variant: "destructive", title: "Create failed", description: res.error });
      return;
    }
    toast({ title: "Network created" });
    setOpenCreateNetwork(false);
    setNetworkForm({ name: "", symbol: "", network: "", is_active: true, sort_order: 0 });
    loadAll();
  };

  const handleUpdateNetwork = async () => {
    if (!openEditNetworkId) return;
    const res = await cryptoApi.updateNetwork(openEditNetworkId, {
      name: networkForm.name.trim(),
      symbol: networkForm.symbol.trim(),
      network: networkForm.network.trim(),
      is_active: networkForm.is_active,
      sort_order: Number(networkForm.sort_order) || 0,
    });
    if (!res.success) {
      toast({ variant: "destructive", title: "Update failed", description: res.error });
      return;
    }
    toast({ title: "Network updated" });
    setOpenEditNetworkId(null);
    loadAll();
  };

  const handleDeleteNetwork = async (id: string) => {
    const res = await cryptoApi.deleteNetwork(id);
    if (!res.success) {
      toast({ variant: "destructive", title: "Delete failed", description: res.error });
      return;
    }
    toast({ title: "Network deleted" });
    loadAll();
  };

  const handleCreateAddress = async () => {
    const res = await cryptoApi.createAddress({
      network_id: addressForm.network_id,
      address: addressForm.address.trim(),
      is_active: addressForm.is_active,
    });
    if (!res.success) {
      toast({ variant: "destructive", title: "Create failed", description: res.error });
      return;
    }
    toast({ title: "Address created" });
    setOpenCreateAddress(false);
    setAddressForm({ network_id: "", address: "", is_active: true });
    loadAll();
  };

  const handleUpdateAddress = async () => {
    if (!openEditAddressId) return;
    const res = await cryptoApi.updateAddress(openEditAddressId, {
      network_id: addressForm.network_id,
      address: addressForm.address.trim(),
      is_active: addressForm.is_active,
    });
    if (!res.success) {
      toast({ variant: "destructive", title: "Update failed", description: res.error });
      return;
    }
    toast({ title: "Address updated" });
    setOpenEditAddressId(null);
    loadAll();
  };

  const handleDeleteAddress = async (id: string) => {
    const res = await cryptoApi.deleteAddress(id);
    if (!res.success) {
      toast({ variant: "destructive", title: "Delete failed", description: res.error });
      return;
    }
    toast({ title: "Address deleted" });
    loadAll();
  };

  const handleCreateTip = async () => {
    const res = await cryptoApi.createTip({
      network_id: tipForm.network_id,
      amount: tipForm.amount.trim(),
      currency: tipForm.currency.trim(),
      is_active: tipForm.is_active,
    });
    if (!res.success) {
      toast({ variant: "destructive", title: "Create failed", description: res.error });
      return;
    }
    toast({ title: "Tip created" });
    setOpenCreateTip(false);
    setTipForm({ network_id: "", amount: "", currency: "USDT", is_active: true });
    loadAll();
  };

  const handleUpdateTip = async () => {
    if (!openEditTipId) return;
    const res = await cryptoApi.updateTip(openEditTipId, {
      network_id: tipForm.network_id,
      amount: tipForm.amount.trim(),
      currency: tipForm.currency.trim(),
      is_active: tipForm.is_active,
    });
    if (!res.success) {
      toast({ variant: "destructive", title: "Update failed", description: res.error });
      return;
    }
    toast({ title: "Tip updated" });
    setOpenEditTipId(null);
    loadAll();
  };

  const handleDeleteTip = async (id: string) => {
    const res = await cryptoApi.deleteTip(id);
    if (!res.success) {
      toast({ variant: "destructive", title: "Delete failed", description: res.error });
      return;
    }
    toast({ title: "Tip deleted" });
    loadAll();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-2">Manage all payment methods and settings. Category: Crypto Payments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crypto Payments</CardTitle>
          <CardDescription>Configure cryptocurrency payment options</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="networks">Networks</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="tips">Tips</TabsTrigger>
            </TabsList>

            <TabsContent value="networks" className="space-y-4 mt-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">Active networks available for payments</p>
                <Dialog open={openCreateNetwork} onOpenChange={setOpenCreateNetwork}>
                  <DialogTrigger asChild>
                    <Button size="sm">Add Network</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Network</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                      <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input value={networkForm.name} onChange={(e) => setNetworkForm({ ...networkForm, name: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Symbol</Label>
                        <Input value={networkForm.symbol} onChange={(e) => setNetworkForm({ ...networkForm, symbol: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Network</Label>
                        <Input value={networkForm.network} onChange={(e) => setNetworkForm({ ...networkForm, network: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Switch checked={networkForm.is_active} onCheckedChange={(v) => setNetworkForm({ ...networkForm, is_active: v })} />
                          <Label>Active</Label>
                        </div>
                        <div className="grid gap-2">
                          <Label>Sort Order</Label>
                          <Input type="number" value={networkForm.sort_order} onChange={(e) => setNetworkForm({ ...networkForm, sort_order: Number(e.target.value || 0) })} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpenCreateNetwork(false)}>Cancel</Button>
                        <Button onClick={handleCreateNetwork}>Create</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {networks.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium">{n.name}</TableCell>
                      <TableCell>{n.symbol}</TableCell>
                      <TableCell>{n.network}</TableCell>
                      <TableCell>
                        {n.is_active ? <Badge>Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Dialog open={openEditNetworkId === n.id} onOpenChange={(o) => {
                          if (!o) { setOpenEditNetworkId(null); return; }
                          setNetworkForm({ name: n.name, symbol: n.symbol, network: n.network, is_active: n.is_active, sort_order: n.sort_order });
                          setOpenEditNetworkId(n.id);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">Edit</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Network</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-2">
                              <div className="grid gap-2">
                                <Label>Name</Label>
                                <Input value={networkForm.name} onChange={(e) => setNetworkForm({ ...networkForm, name: e.target.value })} />
                              </div>
                              <div className="grid gap-2">
                                <Label>Symbol</Label>
                                <Input value={networkForm.symbol} onChange={(e) => setNetworkForm({ ...networkForm, symbol: e.target.value })} />
                              </div>
                              <div className="grid gap-2">
                                <Label>Network</Label>
                                <Input value={networkForm.network} onChange={(e) => setNetworkForm({ ...networkForm, network: e.target.value })} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                  <Switch checked={networkForm.is_active} onCheckedChange={(v) => setNetworkForm({ ...networkForm, is_active: v })} />
                                  <Label>Active</Label>
                                </div>
                                <div className="grid gap-2">
                                  <Label>Sort Order</Label>
                                  <Input type="number" value={networkForm.sort_order} onChange={(e) => setNetworkForm({ ...networkForm, sort_order: Number(e.target.value || 0) })} />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setOpenEditNetworkId(null)}>Cancel</Button>
                                <Button onClick={handleUpdateNetwork}>Save</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteNetwork(n.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {networks.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No networks</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="addresses" className="space-y-4 mt-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">Wallet addresses per network</p>
                <Dialog open={openCreateAddress} onOpenChange={setOpenCreateAddress}>
                  <DialogTrigger asChild>
                    <Button size="sm">Add Address</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Address</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                      <div className="grid gap-2">
                        <Label>Network</Label>
                        <select
                          className="border rounded-md h-9 px-3 bg-transparent"
                          value={addressForm.network_id}
                          onChange={(e) => setAddressForm({ ...addressForm, network_id: e.target.value })}
                        >
                          <option value="">Select network</option>
                          {networks.map((n) => (
                            <option key={n.id} value={n.id}>{n.name} ({n.symbol} {n.network})</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Address</Label>
                        <Input value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={addressForm.is_active} onCheckedChange={(v) => setAddressForm({ ...addressForm, is_active: v })} />
                        <Label>Active</Label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpenCreateAddress(false)}>Cancel</Button>
                        <Button onClick={handleCreateAddress}>Create</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addresses.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium break-all">{a.address}</TableCell>
                      <TableCell>{networkMap[a.network_id]?.name} ({networkMap[a.network_id]?.symbol} {networkMap[a.network_id]?.network})</TableCell>
                      <TableCell>
                        {a.is_active ? <Badge>Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Dialog open={openEditAddressId === a.id} onOpenChange={(o) => {
                          if (!o) { setOpenEditAddressId(null); return; }
                          setAddressForm({ network_id: a.network_id, address: a.address, is_active: a.is_active });
                          setOpenEditAddressId(a.id);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">Edit</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Address</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-2">
                              <div className="grid gap-2">
                                <Label>Network</Label>
                                <select
                                  className="border rounded-md h-9 px-3 bg-transparent"
                                  value={addressForm.network_id}
                                  onChange={(e) => setAddressForm({ ...addressForm, network_id: e.target.value })}
                                >
                                  <option value="">Select network</option>
                                  {networks.map((n) => (
                                    <option key={n.id} value={n.id}>{n.name} ({n.symbol} {n.network})</option>
                                  ))}
                                </select>
                              </div>
                              <div className="grid gap-2">
                                <Label>Address</Label>
                                <Input value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} />
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch checked={addressForm.is_active} onCheckedChange={(v) => setAddressForm({ ...addressForm, is_active: v })} />
                                <Label>Active</Label>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setOpenEditAddressId(null)}>Cancel</Button>
                                <Button onClick={handleUpdateAddress}>Save</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteAddress(a.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {addresses.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">No addresses</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4 mt-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">Tip presets per network</p>
                <Dialog open={openCreateTip} onOpenChange={setOpenCreateTip}>
                  <DialogTrigger asChild>
                    <Button size="sm">Add Tip</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Tip</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                      <div className="grid gap-2">
                        <Label>Network</Label>
                        <select
                          className="border rounded-md h-9 px-3 bg-transparent"
                          value={tipForm.network_id}
                          onChange={(e) => setTipForm({ ...tipForm, network_id: e.target.value })}
                        >
                          <option value="">Select network</option>
                          {networks.map((n) => (
                            <option key={n.id} value={n.id}>{n.name} ({n.symbol} {n.network})</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Amount</Label>
                        <Input value={tipForm.amount} onChange={(e) => setTipForm({ ...tipForm, amount: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Currency</Label>
                        <Input value={tipForm.currency} onChange={(e) => setTipForm({ ...tipForm, currency: e.target.value })} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={tipForm.is_active} onCheckedChange={(v) => setTipForm({ ...tipForm, is_active: v })} />
                        <Label>Active</Label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpenCreateTip(false)}>Cancel</Button>
                        <Button onClick={handleCreateTip}>Create</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tips.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.amount}</TableCell>
                      <TableCell>{t.currency}</TableCell>
                      <TableCell>{networkMap[t.network_id]?.name} ({networkMap[t.network_id]?.symbol} {networkMap[t.network_id]?.network})</TableCell>
                      <TableCell>
                        {t.is_active ? <Badge>Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Dialog open={openEditTipId === t.id} onOpenChange={(o) => {
                          if (!o) { setOpenEditTipId(null); return; }
                          setTipForm({ network_id: t.network_id, amount: t.amount, currency: t.currency, is_active: t.is_active });
                          setOpenEditTipId(t.id);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">Edit</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Tip</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-2">
                              <div className="grid gap-2">
                                <Label>Network</Label>
                                <select
                                  className="border rounded-md h-9 px-3 bg-transparent"
                                  value={tipForm.network_id}
                                  onChange={(e) => setTipForm({ ...tipForm, network_id: e.target.value })}
                                >
                                  <option value="">Select network</option>
                                  {networks.map((n) => (
                                    <option key={n.id} value={n.id}>{n.name} ({n.symbol} {n.network})</option>
                                  ))}
                                </select>
                              </div>
                              <div className="grid gap-2">
                                <Label>Amount</Label>
                                <Input value={tipForm.amount} onChange={(e) => setTipForm({ ...tipForm, amount: e.target.value })} />
                              </div>
                              <div className="grid gap-2">
                                <Label>Currency</Label>
                                <Input value={tipForm.currency} onChange={(e) => setTipForm({ ...tipForm, currency: e.target.value })} />
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch checked={tipForm.is_active} onCheckedChange={(v) => setTipForm({ ...tipForm, is_active: v })} />
                                <Label>Active</Label>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setOpenEditTipId(null)}>Cancel</Button>
                                <Button onClick={handleUpdateTip}>Save</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteTip(t.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {tips.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No tips</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}




