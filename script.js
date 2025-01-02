// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAdekDU05GJpLjJCQ6Mk_H3WafMtiHr-fM",
    authDomain: "aslskks-b468a.firebaseapp.com",
    databaseURL: "https://aslskks-b468a-default-rtdb.firebaseio.com",
    projectId: "aslskks-b468a",
    storageBucket: "aslskks-b468a.firebasestorage.app",
    messagingSenderId: "665183046756",
    appId: "1:665183046756:web:955daa71668940a7632371",
    measurementId: "G-ZL3JDSB854"
  };

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.getAuth(app);
const database = firebase.getDatabase(app);

// Registro
document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const userCredential = await firebase.createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Guardar IP simulada y otros datos en la base de datos
        const ip = 'Simulated_IP'; // Reemplaza con un servicio de detección de IP real si lo necesitas
        await firebase.set(firebase.ref(database, `users/${user.uid}`), {
            email: user.email,
            ip: ip,
            banned: false
        });

        alert('Usuario registrado correctamente.');
    } catch (error) {
        alert('Error al registrar: ' + error.message);
    }
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const userCredential = await firebase.signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userRef = firebase.ref(database, `users/${user.uid}`);
        const snapshot = await firebase.get(userRef);

        if (snapshot.exists() && snapshot.val().banned) {
            alert('Este usuario está baneado.');
            return;
        }

        // Validar si el usuario es administrador
        if (email === "admin24446666668888888@example.com") {  // Reemplaza con el correo del admin
            loadAdminSection(email);
        } else {
            alert('Inicio de sesión exitoso.');
        }
    } catch (error) {
        alert('Error al iniciar sesión: ' + error.message);
    }
});

// Cargar dinámicamente la sección de administración
function loadAdminSection(email) {
    const adminSection = document.createElement('div');
    adminSection.innerHTML = `
        <h2>Administración</h2>
        <p>Usuario actual: ${email}</p>
        <button id="logoutButton">Cerrar Sesión</button>
        <h3>Banear Usuario</h3>
        <form id="banForm">
            <input type="email" id="banEmail" placeholder="Correo del usuario a banear" required>
            <button type="submit">Banear</button>
        </form>
    `;
    document.body.appendChild(adminSection);

    // Agregar funcionalidad de logout y ban
    document.getElementById('logoutButton').addEventListener('click', () => {
        firebase.signOut(auth).then(() => {
            adminSection.remove();
            alert('Sesión cerrada.');
        });
    });

    document.getElementById('banForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const emailToBan = document.getElementById('banEmail').value;

        const usersRef = firebase.ref(database, 'users');
        const snapshot = await firebase.get(usersRef);

        snapshot.forEach((childSnapshot) => {
            const userData = childSnapshot.val();
            if (userData.email === emailToBan) {
                firebase.update(childSnapshot.ref, { banned: true });
                alert(`Usuario ${emailToBan} ha sido baneado.`);
            }
        });
    });
}
