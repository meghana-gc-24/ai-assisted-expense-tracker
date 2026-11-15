import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [expenses, setExpenses] = useState(() => {
  const savedExpenses = JSON.parse(localStorage.getItem('expenses'))
  return savedExpenses || [
    { id: 1, amount: 300, category: 'Groceries', date: new Date().toISOString().split('T')[0], note: 'Shopping' },
    { id: 2, amount: 200, category: 'Transport', date: new Date().toISOString().split('T')[0], note: 'Travel' }
  ]
})

  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [newCategory, setNewCategory] = useState('')
  const [note, setNote] = useState('')
 const [categories, setCategories] = useState(() => {
  return JSON.parse(localStorage.getItem('categories')) || [
    'Food',
    'Transport',
    'Bills',
    'Shopping',
    'Entertainment',
    'Other'
  ]
})
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('expenses', JSON.stringify(expenses))
    }, 300)

    return () => clearTimeout(timer)
  }, [expenses])

  const addExpense = (e) => {
    e.preventDefault()

    if (Number(amount) <= 0 || !category || note.length > 120) {
      alert('Please enter valid expense details.')
      return
    }

    const newExpense = {
      id: Date.now(),
      amount: Number(amount),
      category,
      date,
      note
    }

    const updatedExpenses = [...expenses, newExpense]
localStorage.setItem('expenses', JSON.stringify(updatedExpenses))
setExpenses(updatedExpenses)
    setAmount('')
    setCategory('')
    setDate(new Date().toISOString().split('T')[0])
    setNote('')
  }
const exportCSV = () => {
  const headers = ['Amount', 'Category', 'Date', 'Note']
  const rows = expenses.map((expense) => [
    expense.amount,
    expense.category,
    expense.date,
    expense.note
  ])

  const csvContent = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'expenses.csv'
  link.click()
  URL.revokeObjectURL(url)
}
  const deleteExpense = (id) => {
  if (window.confirm('Are you sure you want to delete this expense?')) {
    const updatedExpenses = expenses.filter(
      (expense) => expense.id !== id
    )
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses))
    setExpenses(updatedExpenses)
  }
}

 const addCategory = () => {
  const trimmedCategory = newCategory.trim()

  if (!trimmedCategory) {
    alert('Please enter a category name.')
    return
  }

  if (categories.includes(trimmedCategory)) {
    alert('Category already exists.')
    return
  }

  const updatedCategories = [...categories, trimmedCategory]
  setCategories(updatedCategories)
  localStorage.setItem('categories', JSON.stringify(updatedCategories))
  setNewCategory('')
} 
const editCategory = (oldCategory) => {
  const updatedName = prompt('Enter the new category name:', oldCategory)

  if (!updatedName || !updatedName.trim()) return

  const trimmedName = updatedName.trim()

  if (categories.includes(trimmedName)) {
    alert('Category already exists.')
    return
  }

  const updatedCategories = categories.map((item) =>
    item === oldCategory ? trimmedName : item
  )

  setCategories(updatedCategories)
  localStorage.setItem('categories', JSON.stringify(updatedCategories))
}
const deleteCategory = (item) => {
  if (window.confirm('Are you sure you want to delete this category?')) {
    const updatedCategories = categories.filter(
      (category) => category !== item
    )

    setCategories(updatedCategories)
    localStorage.setItem('categories', JSON.stringify(updatedCategories))
  }
}
const [sortBy, setSortBy] = useState('date')
const sortedExpenses = [...expenses].sort((a, b) => {
  if (sortBy === 'date') {
    return new Date(b.date) - new Date(a.date)
  }
  if (sortBy === 'amount') {
    return b.amount - a.amount
  }
  return 0
})
const today = new Date()
const currentMonth = today.toISOString().slice(0, 7)

const previousDate = new Date(
  today.getFullYear(),
  today.getMonth() - 1,
  1
)
const previousMonth = previousDate.toISOString().slice(0, 7)

const thisMonthTotal = expenses
  .filter((expense) => expense.date.startsWith(currentMonth))
  .reduce((sum, expense) => sum + Number(expense.amount), 0)

const lastMonthTotal = expenses
  .filter((expense) => expense.date.startsWith(previousMonth))
  .reduce((sum, expense) => sum + Number(expense.amount), 0)

const monthlyChange = lastMonthTotal > 0
  ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
  : null
 const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
 const monthlyTrend = Array.from({ length: 6 }, (_, index) => {
  const date = new Date()
  date.setMonth(date.getMonth() - (5 - index))
  const month = date.toISOString().slice(0, 7)

  const amount = expenses
    .filter((expense) => expense.date.startsWith(month))
    .reduce((sum, expense) => sum + Number(expense.amount), 0)

  return {
    month: date.toLocaleString('default', { month: 'short' }),
    amount
  }
})
 const categoryTotals = categories.map((category) => ({
  category,
  amount: expenses
    .filter((expense) => expense.category.toLowerCase() === category.toLowerCase())
    .reduce((sum, expense) => sum + Number(expense.amount), 0)
})).filter((item) => item.amount > 0) 
 return (
    <div className="app">
      <h1>AI-Assisted Expense Tracker</h1>
      <p>Manage your daily expenses easily.</p>

      <h2>Monthly Summary</h2>
      <button onClick={exportCSV}>
  Export Expenses to CSV
</button>
<p>This Month: ₹{thisMonthTotal.toFixed(2)}</p>
<p>Last Month: ₹{lastMonthTotal.toFixed(2)}</p>
<p>
  Monthly Change: {monthlyChange !== null
    ? `${monthlyChange.toFixed(2)}%`
    : 'No previous month data'}
</p>

      <form onSubmit={addExpense}>
        <h2>Add New Expense</h2>

        <label>Amount</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <label>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <label>Note (Maximum 120 characters)</label>
        <input
          type="text"
          maxLength="120"
          placeholder="Enter a note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button type="submit">Add Expense</button>
      </form>

     <h2>Category-wise Expense Chart</h2>
<div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
  {categoryTotals.map((item) => (
    <div key={item.category}>
      <p>{item.category}: ₹{item.amount.toFixed(2)}</p>
      <div style={{ background: '#eee', height: '18px', borderRadius: '10px' }}>
        <div
          style={{
            background: '#9370DB',
            width: `${(item.amount / Math.max(...categoryTotals.map((x) => x.amount))) * 100}%`,
            height: '18px',
            borderRadius: '10px'
          }}
        />
      </div>
    </div>
  ))}
</div>
<h2>Category-wise Expense Pie Chart</h2>
<div style={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
 <svg width="200" height="200" viewBox="0 0 200 200">
 {categoryTotals.map((item, index) => {
  const colors = ['#9370DB', '#BA55D3', '#DDA0DD', '#8A2BE2', '#C8A2C8', '#7B68EE']
  const totalAmount = categoryTotals.reduce((sum, x) => sum + x.amount, 0)
  const circumference = 2 * Math.PI * 50
  const previousAmount = categoryTotals.slice(0, index).reduce((sum, x) => sum + x.amount, 0)

  return (
    <circle
      key={item.category}
      cx="100"
      cy="100"
      r="50"
      fill="none"
      stroke={colors[index % colors.length]}
      strokeWidth="100"
      strokeDasharray={`${(item.amount / totalAmount) * circumference} ${circumference}`}
      strokeDashoffset={`${-(previousAmount / totalAmount) * circumference}`}
      transform="rotate(-90 100 100)"
    />
  )
})}
</svg>
</div>
<div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
  {categoryTotals.map((item, index) => (
    <div key={item.category} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <span style={{
        width: '12px',
        height: '12px',
        background: ['#9370DB', '#BA55D3', '#DDA0DD', '#8A2BE2', '#C8A2C8', '#7B68EE'][index % 6],
        borderRadius: '50%',
        display: 'inline-block'
      }} />
      <span>{item.category}</span>
    </div>
  ))}
</div>
{categoryTotals.map((item, index) => (
  <p key={item.category}>
    {item.category}: ₹{item.amount.toFixed(2)}
  </p>
))}
<h2>6-Month Expense Trend</h2>
<div style={{ display: 'flex', alignItems: 'end', gap: '12px', height: '180px', padding: '15px' }}>
  {monthlyTrend.map((item) => (
    <div key={item.month} style={{ flex: 1, textAlign: 'center' }}>
      <div
        style={{
          height: `${Math.max((item.amount / Math.max(...monthlyTrend.map((x) => x.amount), 1)) * 130, 4)}px`,
          background: '#9370DB',
          borderRadius: '6px 6px 0 0'
        }}
      />
      <small>{item.month}</small>
      <p>₹{item.amount}</p>
    </div>
  ))}
</div>
      <h2>Manage Categories</h2>

<div className="category-manager">
  <input
    type="text"
    placeholder="Enter new category"
    value={newCategory}
    onChange={(e) => setNewCategory(e.target.value)}
  />
  <button onClick={addCategory}>Add Category</button>
</div>

<ul>
 {categories.map((item) => (
  <li key={item}>
    {item}
    <button onClick={() => editCategory(item)}>Edit</button>
    <button onClick={() => deleteCategory(item)}>Delete</button>
  </li>
))}
</ul>
      <h2>Expense List</h2>
      <div>
  <label>Sort Expenses: </label>
  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
    <option value="date">Newest First</option>
    <option value="amount">Highest Amount First</option>
  </select>
</div>

      {expenses.length === 0 ? (
        <p>No expenses added yet.</p>
      ) : (
        sortedExpenses.map((expense) => (
          <div className="expense" key={expense.id}>
            <p><strong>Amount:</strong> ₹{expense.amount}</p>
            <p><strong>Category:</strong> {expense.category}</p>
            <p><strong>Date:</strong> {expense.date}</p>
            <p><strong>Note:</strong> {expense.note || 'No note'}</p>
            <button onClick={() => deleteExpense(expense.id)}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  )
}

export default App