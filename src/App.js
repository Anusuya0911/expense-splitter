import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

function App() {
  const [groupName, setGroupName] = useState("");
  const [member, setMember] = useState("");
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");

  const [balances, setBalances] = useState([]);

  const addMember = () => {
    if (!member) return;
    setMembers([...members, member]);
    setMember("");
  };

  const createGroup = async () => {
    if (!groupName || members.length === 0) {
      alert("Enter group & members");
      return;
    }

    await addDoc(collection(db, "groups"), {
      name: groupName,
      members: members
    });

    setGroupName("");
    setMembers([]);
    fetchGroups();
    alert("Group Created!");
  };

  const fetchGroups = async () => {
    const data = await getDocs(collection(db, "groups"));
    setGroups(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const addExpense = async () => {
    if (!amount || !paidBy || !selectedGroup) {
      alert("Fill all fields");
      return;
    }

    await addDoc(collection(db, "expenses"), {
      amount: Number(amount),
      paidBy: paidBy,
      members: selectedGroup.members,
      groupId: selectedGroup.id
    });

    alert("Expense Added!");
  };

  const calculateBalances = async () => {
    const snapshot = await getDocs(collection(db, "expenses"));
    let temp = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.groupId !== selectedGroup.id) return;

      const split = data.amount / data.members.length;

      data.members.forEach(person => {
        if (person !== data.paidBy) {
          const key = person + " owes " + data.paidBy;
          temp[key] = (temp[key] || 0) + split;
        }
      });
    });

    setBalances(Object.entries(temp));
  };

  return (
    <div style={styles.container}>
      <h2>💰 Expense Splitter</h2>

      {/* Create Group */}
      <div style={styles.card}>
        <h3>Create Group</h3>

        <input
          style={styles.input}
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <input
            style={styles.input}
            placeholder="Add Member"
            value={member}
            onChange={(e) => setMember(e.target.value)}
          />
          <button style={styles.button} onClick={addMember}>Add</button>
        </div>

        <ul>
          {members.map((m, i) => <li key={i}>{m}</li>)}
        </ul>

        <button style={styles.button} onClick={createGroup}>
          Create Group
        </button>
      </div>

      {/* Select Group */}
      <div style={styles.card}>
        <h3>Select Group</h3>

        <select
          style={styles.input}
          onChange={(e) =>
            setSelectedGroup(groups.find(g => g.id === e.target.value))
          }
        >
          <option value="">-- Select Group --</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        {selectedGroup && (
          <p>Members: {selectedGroup.members.join(", ")}</p>
        )}
      </div>

      {/* Add Expense */}
      <div style={styles.card}>
        <h3>Add Expense</h3>

        <input
          style={styles.input}
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {/* ✅ DROPDOWN FIX */}
        <select
          style={styles.input}
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
        >
          <option value="">Select Payer</option>
          {selectedGroup &&
            selectedGroup.members.map((m, i) => (
              <option key={i} value={m}>{m}</option>
            ))}
        </select>

        <button style={styles.button} onClick={addExpense}>
          Add Expense
        </button>
      </div>

      {/* Show Balances */}
      <div style={styles.card}>
        <h3>Balances</h3>

        <button style={styles.button} onClick={calculateBalances}>
          Calculate Balances
        </button>

        {balances.length === 0 ? (
          <p>No balances yet</p>
        ) : (
          balances.map(([k, v], i) => (
            <p key={i}>
              {k} : ₹{v.toFixed(2)}
            </p>
          ))
        )}
      </div>

      {/* Groups */}
      <div style={styles.card}>
        <h3>All Groups</h3>
        {groups.map(g => (
          <div key={g.id} style={styles.groupBox}>
            <b>{g.name}</b>
            <p>{g.members.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 500,
    margin: "auto",
    padding: 20,
    fontFamily: "Arial"
  },
  card: {
    background: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  },
  input: {
    width: "100%",
    padding: 8,
    margin: "8px 0",
    borderRadius: 5,
    border: "1px solid #ccc"
  },
  button: {
    padding: "8px 12px",
    marginTop: 5,
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer"
  },
  groupBox: {
    background: "#fff",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    border: "1px solid #ddd"
  }
};

export default App;