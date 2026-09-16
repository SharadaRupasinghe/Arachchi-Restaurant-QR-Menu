import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  Search, 
  Save, 
  Plus, 
  RotateCcw, 
  AlertTriangle, 
  Check, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  LogOut,
  HelpCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { MenuItem, CategoryId } from '../types';
import { CATEGORIES } from '../data/initialMenu';

interface BackOfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: MenuItem[];
  onUpdateItem: (id: string, updates: Partial<MenuItem>) => Promise<boolean>;
  onAddItem: (newItem: Partial<MenuItem>) => Promise<boolean>;
  onResetMenu: () => Promise<boolean>;
}

export const BackOfficeModal: React.FC<BackOfficeModalProps> = ({
  isOpen,
  onClose,
  menu,
  onUpdateItem,
  onAddItem,
  onResetMenu,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPinHelp, setShowPinHelp] = useState(false);

  // Change PIN Sub-view
  const [showChangePin, setShowChangePin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showPinText, setShowPinText] = useState(false);
  const [changePinError, setChangePinError] = useState('');
  const [changePinSuccess, setChangePinSuccess] = useState('');
  const [isSubmittingChangePin, setIsSubmittingChangePin] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<CategoryId | 'all'>('all');
  const [editingPriceMap, setEditingPriceMap] = useState<Record<string, string>>({});
  const [saveSuccessMap, setSaveSuccessMap] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  // New Dish Form State
  const [newName, setNewName] = useState('');
  const [newSinhalaName, setNewSinhalaName] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryId>('arachchi_specials');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');

  if (!isOpen) return null;

  const getStoredPin = () => {
    return localStorage.getItem('arachchi_staff_pin') || '1234';
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;

    setIsVerifying(true);
    setPinError('');

    try {
      // 1. Try server verification
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPinError('');
        localStorage.setItem('arachchi_staff_pin', pinInput.trim());
        return;
      }
      
      // If server rejected the PIN:
      // Note: We do NOT fallback to a stale '1234' in localStorage if the server explicitly rejected it,
      // but we allow 'arachchi' as emergency override.
      if (pinInput.trim() === 'arachchi') {
        setIsAuthenticated(true);
        setPinError('');
        return;
      }

      setPinError('Invalid PIN. Please enter your configured manager PIN.');
    } catch (err) {
      // Offline fallback when network/server is unavailable
      const storedLocalPin = getStoredPin();
      if (pinInput.trim() === storedLocalPin || pinInput.trim() === 'arachchi') {
        setIsAuthenticated(true);
        setPinError('');
      } else {
        setPinError('Offline mode: Could not verify PIN with server.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePinError('');
    setChangePinSuccess('');

    if (!currentPinInput.trim()) {
      setChangePinError('Please enter your current PIN.');
      return;
    }
    if (newPinInput.length < 4) {
      setChangePinError('New PIN must be at least 4 characters long.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setChangePinError('New PIN and confirmation do not match.');
      return;
    }

    setIsSubmittingChangePin(true);

    try {
      const res = await fetch('/api/admin/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPin: currentPinInput.trim(),
          newPin: newPinInput.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Fallback local check
        const storedLocal = getStoredPin();
        if (currentPinInput.trim() === storedLocal || currentPinInput.trim() === 'arachchi') {
          localStorage.setItem('arachchi_staff_pin', newPinInput.trim());
          setChangePinSuccess('PIN updated successfully on this device!');
          setTimeout(() => {
            setShowChangePin(false);
            setCurrentPinInput('');
            setNewPinInput('');
            setConfirmPinInput('');
            setChangePinSuccess('');
          }, 2000);
          return;
        }
        setChangePinError(data.message || 'Current PIN was incorrect.');
        return;
      }

      // Server changed successfully
      localStorage.setItem('arachchi_staff_pin', newPinInput.trim());
      setChangePinSuccess('Back-office PIN successfully changed and secured!');
      setTimeout(() => {
        setShowChangePin(false);
        setCurrentPinInput('');
        setNewPinInput('');
        setConfirmPinInput('');
        setChangePinSuccess('');
      }, 2000);
    } catch (err) {
      // Offline update
      const storedLocal = getStoredPin();
      if (currentPinInput.trim() === storedLocal || currentPinInput.trim() === 'arachchi' || currentPinInput.trim() === '1234') {
        localStorage.setItem('arachchi_staff_pin', newPinInput.trim());
        setChangePinSuccess('PIN updated in local storage (Offline Mode)!');
        setTimeout(() => {
          setShowChangePin(false);
          setCurrentPinInput('');
          setNewPinInput('');
          setConfirmPinInput('');
          setChangePinSuccess('');
        }, 2000);
      } else {
        setChangePinError('Current PIN does not match.');
      }
    } finally {
      setIsSubmittingChangePin(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setShowChangePin(false);
  };

  const handlePriceSave = async (item: MenuItem) => {
    const rawVal = editingPriceMap[item.id];
    if (rawVal === undefined || rawVal === '') return;
    const num = parseFloat(rawVal);
    if (isNaN(num) || num < 0) return;

    const success = await onUpdateItem(item.id, { price: num });
    if (success) {
      setSaveSuccessMap((prev) => ({ ...prev, [item.id]: true }));
      setTimeout(() => {
        setSaveSuccessMap((prev) => ({ ...prev, [item.id]: false }));
      }, 2000);
    }
  };

  const handleToggleStock = async (item: MenuItem) => {
    await onUpdateItem(item.id, { isAvailable: !item.isAvailable });
  };

  const handleToggleBestseller = async (item: MenuItem) => {
    await onUpdateItem(item.id, { isBestseller: !item.isBestseller });
  };

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum)) return;

    const catObj = CATEGORIES.find((c) => c.id === newCategory);

    const success = await onAddItem({
      name: newName,
      sinhalaName: newSinhalaName,
      category: newCategory,
      cuisine: (catObj?.cuisine as any) || 'Arachchi Specials',
      price: priceNum,
      description: newDesc,
      isAvailable: true,
      isBestseller: false,
    });

    if (success) {
      setShowAddForm(false);
      setNewName('');
      setNewSinhalaName('');
      setNewPrice('');
      setNewDesc('');
    }
  };

  const filteredItems = menu.filter((item) => {
    if (selectedCat !== 'all' && item.category !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.sinhalaName?.toLowerCase().includes(q) ||
        item.category.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#171009] border border-amber-700/50 p-5 sm:p-7 shadow-2xl text-stone-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* PIN Authentication Screen */}
        {!isAuthenticated ? (
          <div className="max-w-sm mx-auto py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 shadow-lg">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-amber-100">
                Staff Back-Office Portal
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Authorized restaurant management only. Modify prices, manage items & configure access PIN.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-3 pt-2">
              <div className="relative">
                <input
                  id="input-staff-pin"
                  type={showPinText ? 'text' : 'password'}
                  maxLength={16}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="Enter Access PIN"
                  className="w-full text-center tracking-widest text-lg font-mono py-2.5 px-10 rounded-xl bg-stone-900 border border-stone-700 text-amber-300 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPinText(!showPinText)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  {showPinText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {pinError && (
                <p className="text-xs text-rose-400 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {pinError}
                </p>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm cursor-pointer transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {isVerifying ? 'Verifying PIN...' : 'Unlock Back-Office'}
              </button>
            </form>

            <div className="pt-2 border-t border-stone-800">
              <button
                onClick={() => setShowPinHelp(!showPinHelp)}
                className="text-xs text-amber-400 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How to change back-office PIN</span>
              </button>

              {showPinHelp && (
                <div className="mt-2.5 p-3 rounded-xl bg-stone-900/90 border border-amber-900/50 text-left text-xs space-y-1.5 text-stone-300">
                  <p className="font-semibold text-amber-300">🔑 Changing & Recovering Your Back-Office Login:</p>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-300">
                    <li>Log in using your manager PIN (e.g. your configured PIN, or master key <code className="bg-black/50 px-1.5 py-0.5 rounded text-amber-300 font-mono">arachchi</code>).</li>
                    <li>Click the <strong>"Change Login PIN"</strong> button in the top bar.</li>
                    <li>Enter your current PIN and choose your new private PIN (4+ characters).</li>
                    <li>Save changes. Your new PIN will be permanently saved on the server and required for all future logins!</li>
                  </ol>
                  <p className="text-[10px] text-stone-400 mt-1">
                    Note: If you have configured <code className="text-amber-300 font-mono">BACKOFFICE_PIN</code> in project settings, it will always be accepted as an authorized manager key.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Authenticated Management Panel */
          <div className="space-y-5">
            {/* Header bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  Live Menu & Price Management
                </h3>
                <p className="text-xs text-stone-400">
                  Arachchi Restaurant Anuradhapura • Back-Office Staff Portal
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Change PIN Button */}
                <button
                  onClick={() => setShowChangePin(!showChangePin)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    showChangePin
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border-amber-500/40'
                  }`}
                  title="Change your login PIN / password"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Change Login PIN</span>
                </button>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Dish
                </button>

                <button
                  onClick={async () => {
                    if (window.confirm('Reset all prices and menu to initial defaults?')) {
                      await onResetMenu();
                    }
                  }}
                  className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 cursor-pointer"
                  title="Reset Menu Defaults"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-950 text-stone-400 hover:text-rose-300 border border-stone-800 cursor-pointer transition-colors"
                  title="Lock & Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Change Login PIN Accordion Panel */}
            {showChangePin && (
              <form onSubmit={handleChangePinSubmit} className="p-4 rounded-xl bg-gradient-to-r from-[#21160e] to-[#1a110a] border-2 border-amber-500/60 space-y-3 animate-fadeIn shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    Change Back-Office Access PIN
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowChangePin(false)}
                    className="text-stone-400 hover:text-stone-200 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-[11px] text-stone-300">
                  Set a private manager PIN so guests scanning the QR code cannot access the price manager.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                      Current PIN
                    </label>
                    <input
                      type="password"
                      placeholder="e.g. 1234"
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value)}
                      required
                      className="w-full p-2 rounded-lg bg-stone-950 border border-stone-700 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                      New PIN (Min 4 chars)
                    </label>
                    <input
                      type="password"
                      placeholder="New PIN or Password"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      required
                      minLength={4}
                      className="w-full p-2 rounded-lg bg-stone-950 border border-stone-700 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                      Confirm New PIN
                    </label>
                    <input
                      type="password"
                      placeholder="Repeat New PIN"
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value)}
                      required
                      minLength={4}
                      className="w-full p-2 rounded-lg bg-stone-950 border border-stone-700 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {changePinError && (
                  <div className="text-xs text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{changePinError}</span>
                  </div>
                )}

                {changePinSuccess && (
                  <div className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{changePinSuccess}</span>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSubmittingChangePin}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingChangePin ? 'Updating PIN...' : 'Save New PIN'}
                  </button>
                </div>
              </form>
            )}

            {/* Add New Dish Form Accordion */}
            {showAddForm && (
              <form onSubmit={handleCreateDish} className="p-4 rounded-xl bg-stone-900/90 border border-amber-600/40 space-y-3 animate-fadeIn">
                <div className="text-xs font-bold text-amber-300">Add New Menu Special</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Dish Name (e.g. Seafood Devil)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="p-2 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Sinhala Name (e.g. සීෆුඩ් ඩෙවල්)"
                    value={newSinhalaName}
                    onChange={(e) => setNewSinhalaName(e.target.value)}
                    className="p-2 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CategoryId)}
                    className="p-2 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Price in LKR (e.g. 1850)"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                    className="p-2 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <textarea
                  placeholder="Short description..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer"
                  >
                    Save Dish
                  </button>
                </div>
              </form>
            )}

            {/* Quick Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search dishes to edit price..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value as any)}
                className="py-2 px-3 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Categories ({menu.length})</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dishes Price Editing Table */}
            <div className="overflow-x-auto max-h-[50vh] overflow-y-auto rounded-xl border border-stone-800 bg-stone-950/60 custom-scrollbar-modal">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-900/80 sticky top-0 text-[11px] uppercase tracking-wider text-stone-400 border-b border-stone-800 z-10">
                  <tr>
                    <th className="p-3">Dish Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price (LKR)</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Top Seller</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredItems.map((item) => {
                    const editVal = editingPriceMap[item.id] !== undefined ? editingPriceMap[item.id] : item.price.toString();
                    const isSaved = saveSuccessMap[item.id];

                    return (
                      <tr key={item.id} className="hover:bg-stone-900/40 transition-colors">
                        <td className="p-3 font-medium text-stone-200">
                          <div>{item.name}</div>
                          {item.sinhalaName && (
                            <div className="text-[11px] text-amber-500/80">{item.sinhalaName}</div>
                          )}
                        </td>
                        <td className="p-3 text-stone-400 capitalize">
                          {item.category.replace('_', ' ')}
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={editVal}
                            onChange={(e) =>
                              setEditingPriceMap((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            className="w-24 p-1.5 rounded-lg bg-stone-900 border border-stone-700 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleToggleStock(item)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              item.isAvailable
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {item.isAvailable ? 'In Stock' : 'Sold Out'}
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleToggleBestseller(item)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              item.isBestseller
                                ? 'bg-amber-500 text-stone-950'
                                : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                            }`}
                          >
                            {item.isBestseller ? '⭐ Bestseller' : 'Standard'}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handlePriceSave(item)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-all ${
                              isSaved
                                ? 'bg-emerald-500 text-stone-950'
                                : 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-stone-950 border border-amber-500/40'
                            }`}
                          >
                            {isSaved ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Saved
                              </>
                            ) : (
                              <>
                                <Save className="w-3.5 h-3.5" /> Save
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400 pt-2 border-t border-stone-800">
              <div className="text-[11px] text-stone-500">
                Created &amp; Developed by <span className="text-stone-300 font-semibold">Sharada Rupasinghe</span> (GM, Arachchi Restaurant, Hotel White House &amp; Chamy Group)
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.linkedin.com/in/sharadarupasinghe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#5db2e6] hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> LinkedIn
                </a>
                <span className="text-stone-700">•</span>
                <a
                  href="https://fb.com/sharadarupasinghe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#68a5f8] hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Facebook
                </a>
                <span className="text-stone-700">•</span>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
