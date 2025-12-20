import { useState, useEffect } from "react";

function Expenses() {
  const [members, setMembers] = useState(["You"]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("You");
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(saved);
  }, []);

  const addMember = () => {
    if (name && !members.includes(name)) {
      setMembers([...members, name]);
      setName("");
    }
  };

  const addExpense = () => {
    if (!amount || !paidBy) return;

    const expense = {
      id: Date.now(),
      amount: Number(amount),
      paidBy,
      splitAmong: members
    };

    const updated = [...expenses, expense];
    setExpenses(updated);
    localStorage.setItem("expenses", JSON.stringify(updated));
    setAmount("");
  };

  const deleteExpense = (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    const updated = expenses.filter(e => e.id !== expenseId);
    setExpenses(updated);
    localStorage.setItem("expenses", JSON.stringify(updated));
  };

  const calculateSettlement = () => {
    const balance = {};
    members.forEach(m => (balance[m] = 0));

    expenses.forEach(exp => {
      const split = exp.amount / exp.splitAmong.length;
      exp.splitAmong.forEach(m => {
        balance[m] -= split;
      });
      balance[exp.paidBy] += exp.amount;
    });

    return balance;
  };

  const balances = calculateSettlement();

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Trip Wallet</h2>
          <p className="text-zinc-500 text-sm mt-1">Manage group expenses and splits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Input Lists */}
        <div className="space-y-6 lg:col-span-1">
          {/* Members */}
          <div className="glass-panel p-5 rounded-xl">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <span className="iconify text-indigo-500" data-icon="lucide:users" data-width="16"></span>
              Members
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              />
              <button onClick={addMember} className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg text-sm transition-all">
                <span className="iconify" data-icon="lucide:plus" data-width="16"></span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {members.map(m => (
                <span key={m} className="px-2 py-1 bg-white/5 border border-white/5 rounded-md text-xs text-zinc-300">{m}</span>
              ))}
            </div>
          </div>

          {/* Add Expense */}
          <div className="glass-panel p-5 rounded-xl">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <span className="iconify text-emerald-500" data-icon="lucide:banknote" data-width="16"></span>
              Add Expense
            </h3>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              />
              <select
                value={paidBy}
                onChange={e => setPaidBy(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              >
                {members.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <button onClick={addExpense} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium transition-all">Add Expense</button>
            </div>
          </div>
        </div>

        {/* Expenses & Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expenses List */}
          <div className="glass-panel p-5 rounded-xl">
            <h3 className="text-sm font-medium text-white mb-4">Recent Expenses</h3>
            <div className="space-y-3">
              {expenses.length === 0 && <p className="text-sm text-zinc-500">No expenses added yet.</p>}
              {expenses.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <span className="iconify" data-icon="lucide:receipt" data-width="16"></span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Expense</p>
                      <p className="text-xs text-zinc-500">Paid by {e.paidBy}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">₹{e.amount}</span>
                    <button
                      onClick={() => deleteExpense(e.id)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                      title="Delete expense"
                    >
                      <span className="iconify" data-icon="lucide:trash-2" data-width="14"></span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settlement */}
          <div className="glass-panel p-5 rounded-xl">
            <h3 className="text-sm font-medium text-white mb-4">Settlement Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(balances).map(([m, bal]) => (
                <div key={m} className={`p-3 rounded-lg border ${bal > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : bal < 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-zinc-800/50 border-white/5'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{m}</span>
                    <span className={`text-sm font-bold ${bal > 0 ? 'text-emerald-400' : bal < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                      {bal > 0 ? `+₹${bal.toFixed(2)}` : bal < 0 ? `-₹${Math.abs(bal).toFixed(2)}` : 'Settled'}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">
                    {bal > 0 ? 'Gets back' : bal < 0 ? 'Owes' : 'No dues'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Expenses;
