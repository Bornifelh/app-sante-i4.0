import { initializeApp } from "firebase/app";
import { addDoc, collection, doc, getDocs,getDoc, getFirestore, onSnapshot, serverTimestamp } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC877wdPzbzWlrw96qP_nOK_5BuNwJlKbw",
  authDomain: "industrie4-0-86f43.firebaseapp.com",
  projectId: "industrie4-0-86f43",
  storageBucket: "industrie4-0-86f43.appspot.com",
  messagingSenderId: "967263670010",
  appId: "1:967263670010:web:809a86acd9936baf00c343"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const utilisateurs = collection(db, 'utilisateurs');
const patients = collection(db, 'patients');
const parampatients = collection(db, "parampatients");


document.addEventListener('DOMContentLoaded', () => {
    getDocs(utilisateurs).then((snapshot) => {
        let utilisateursList = [];
        snapshot.docs.forEach((doc) => {
            utilisateursList.push({ ...doc.data(), id: doc.id });
        });
        console.log(utilisateursList);
    });


    // get param patients
    getDocs(parampatients).then((snapshot) => {
        let parampatients = [];
        snapshot.docs.forEach((doc) => {
            parampatients.push({ ...doc.data(), id: doc.id });
        });
        console.log(parampatients);
    });


    // recuperation des parametres

     // Fonction pour afficher les informations d'un patient
     const fetchPatientDetails = async (idPatient) => {
        try {
            const patientDoc = doc(db, "patients", idPatient);
            const patientSnapshot = await getDoc(patientDoc);
            if (patientSnapshot.exists()) {
                const patientData = patientSnapshot.data();
                console.log(`Patient details for ${idPatient}: `, patientData); // Log pour débogage
                return patientData;
            } else {
                console.error("No such document!");
                return null;
            }
        } catch (error) {
            console.error("Error fetching patient details:", error);
        }
    };

    // Fonction pour afficher les paramètres des patients
    const renderParaPatients = async (parampatientsList) => {
        const paramsListContainer = document.getElementById('patients-param');
        if (!paramsListContainer) {
            console.error('Element with ID patients-param not found.');
            return;
        }
        paramsListContainer.innerHTML = ''; // Effacer le contenu précédent

        for (let parampatient of parampatientsList) {
            const patientData = await fetchPatientDetails(parampatient.idPatient);
            if (patientData) {
                const paramItem = document.createElement('div');
                paramItem.classList.add('patient-param');
                paramItem.innerHTML = `
                    <h3>ID Patient: ${parampatient.idPatient}</h3>
                    <p>BPM: ${parampatient.bpm}</p>
                    <p>Pression Artérielle: ${parampatient.pressionArt}</p>
                    <p>Température: ${parampatient.temperature}</p>
                    <p>Nom Complet: ${patientData.nomcomplet}</p>
                    <p>Sexe: ${patientData.sexe}</p>
                    <p>Date de Naissance: ${patientData.datenaissance}</p>
                    <p>Age: ${patientData.age}</p>
                    <p>Chambre: ${patientData.chambrepatient}</p>
                `;
                paramsListContainer.appendChild(paramItem);
            }
        }
    };

    // Récupérer et afficher les paramètres des patients en temps réel
    onSnapshot(parampatients, (snapshot) => {
        let parampatientsList = [];
        snapshot.docs.forEach((doc) => {
            parampatientsList.push({ ...doc.data(), id: doc.id });
        });
        console.log("ParamPatients list:", parampatientsList); // Log pour débogage
        renderParaPatients(parampatientsList);
    });


    const renderPatients = (patientsList) => {
        const patientsListContainer = document.getElementById('patients-list');
        patientsListContainer.innerHTML = ''; // Effacer le contenu précédent

        patientsList.forEach(patient => {
            const patientItem = document.createElement('div');
            patientItem.classList.add('patient-item');
            patientItem.innerHTML = `
                <h3>${patient.nomcomplet}</h3>
                <p>Sexe: ${patient.sexe}</p>
                <p>Date de Naissance: ${patient.datenaissance}</p>
                <p>Age: ${patient.age}</p>
                <p>ID Interne: ${patient.idInterne}</p>
                <p>Chambre: ${patient.chambrepatient}</p>
            `;
            patientsListContainer.appendChild(patientItem);
        });
    };

    // Récupérer et afficher les patients en temps réel
    onSnapshot(patients, (snapshot) => {
        let patientsList = [];
        snapshot.docs.forEach((doc) => {
            patientsList.push({ ...doc.data(), id: doc.id });
        });
        renderPatients(patientsList);
    });


    getDocs(patients, (snapshot) => {

    });

    // onSnapshot(patients, (snapshot) => {
    //     let patientsList = [];
    //     snapshot.docs.forEach((doc) => {
    //         patientsList.push({ ...doc.data(), id: doc.id });
    //     });
    //     console.log(patientsList);
    // });

    const addPatientsForm = document.querySelector(".content");
    addPatientsForm.addEventListener("submit", (e) => {
        e.preventDefault();

        addDoc(patients, {
            age: addPatientsForm.age.value,
            chambrepatient: addPatientsForm.chambrepatient.value,
            datenaissance: addPatientsForm.datenaissance.value,
            idInterne: addPatientsForm.idInterne.value,
            nomcomplet: addPatientsForm.nomcomplet.value,
            sexe: addPatientsForm.sexe.value,
            dateDajout: serverTimestamp()
        }).then(() => {
            addPatientsForm.reset();
        });
    });


    //Authentification google
    const signInGoogleBtn = document.querySelector(".googlebutton");
    signInGoogleBtn.addEventListener("click", () =>{
        signInWithPopup(auth, new GoogleAuthProvider());
    });

    onAuthStateChanged(auth, (user) => {
        console.log("Changement du statut de l'utilisateur", user);
        const btnlogin = document.querySelector(".googlebutton");
        btnlogin.style.display = 'none';

        // informations user connecté
        const userConnect = document.getElementById('nameUser');
        userConnect.innerHTML = ''; 

        if (user) {
            // Récupérer les informations de l'utilisateur connecté
            const userInfo = document.createElement('div');
            userInfo.classList.add('userconxion');
            userInfo.innerHTML = `
                <h3>${user.displayName || 'Utilisateur anonyme'}</h3>
                <p>${user.email}</p>
            `;
            userConnect.appendChild(userInfo);
        } else {
            userConnect.innerHTML = '<p>Aucun utilisateur connecté.</p>';
            const btnlogin = document.querySelector(".googlebutton");
        btnlogin.style.display = 'block';
        
        }
    
    });

    const logout = document.querySelector(".logout");
    logout.addEventListener("click", () =>{
        signOut(auth)
        .then(() => console.log("utilisateur deconnecté"))
        .catch((err) => console.log(err.message));
        
    })

});
