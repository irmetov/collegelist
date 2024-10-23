import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase-config"; // Adjust this import based on your Firebase configuration file

const updateSATScores = async (userId, reading, math) => {
  const userRef = doc(db, "users", userId);
  
  // Parse the scores as integers
  const readingScore = parseInt(reading, 10);
  const mathScore = parseInt(math, 10);
  
  // Calculate the total score
  const totalScore = readingScore + mathScore;
  
  try {
    await updateDoc(userRef, {
      satReading: reading,
      satMath: math,
      sat: totalScore.toString() // Update the 'sat' property with the new total
    });
    console.log("SAT scores updated successfully");
    return totalScore.toString(); // Return the new total score
  } catch (error) {
    console.error("Error updating SAT scores: ", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export default updateSATScores;
