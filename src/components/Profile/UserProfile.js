import React, { useState } from 'react';
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig"; // Adjust this import path as needed
import { useAuth } from "../../contexts/AuthContext"; // Adjust this import path as needed

const UserProfile = ({ user, onUserUpdate }) => {
  const { currentUser } = useAuth(); // Get the current authenticated user
  const [name, setName] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [reading, setReading] = useState(user.satReading || '');
  const [math, setMath] = useState(user.satMath || '');
  const [act, setAct] = useState(user.act || '');
  const [gpa, setGpa] = useState(user.gpa || '');
  const [familyIncome, setFamilyIncome] = useState(user.familyIncome || '');
  const [error, setError] = useState('');

  const handleSaveChanges = async () => {
    if (!currentUser) {
      setError('No authenticated user found');
      return;
    }

    const userRef = doc(db, "users", currentUser.uid);
    
    try {
      const readingScore = parseInt(reading, 10) || 0;
      const mathScore = parseInt(math, 10) || 0;
      const totalSAT = readingScore + mathScore;

      const updatedData = {
        username: name,
        email: email,
        satReading: reading,
        satMath: math,
        sat: totalSAT.toString(), // Store the calculated total
        act: act,
        gpa: gpa,
        familyIncome: familyIncome
      };

      await updateDoc(userRef, updatedData);
      console.log("Profile updated successfully");
      setError('');

      if (onUserUpdate) {
        onUserUpdate({
          ...user,
          ...updatedData
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(`Failed to update profile: ${error.message}`);
    }
  };

  return (
    <div className="edit-profile">
      <h2>Edit Profile</h2>
      {error && <p className="error-message">{error}</p>}
      <div>
        <label>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label>Profile Image</label>
        <input type="file" />
      </div>
      <div>
        <label>SAT Reading</label>
        <input type="number" value={reading} onChange={(e) => setReading(e.target.value)} />
      </div>
      <div>
        <label>SAT Math</label>
        <input type="number" value={math} onChange={(e) => setMath(e.target.value)} />
      </div>
      <div>
        <label>ACT Score</label>
        <input type="number" value={act} onChange={(e) => setAct(e.target.value)} />
      </div>
      <div>
        <label>GPA</label>
        <input type="number" value={gpa} onChange={(e) => setGpa(e.target.value)} />
      </div>
      <div>
        <label>Family Income</label>
        <input type="number" value={familyIncome} onChange={(e) => setFamilyIncome(e.target.value)} />
      </div>
      <button onClick={handleSaveChanges}>Save Changes</button>
    </div>
  );
};

export default UserProfile;
