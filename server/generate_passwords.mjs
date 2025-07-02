import crypto from 'crypto';

/**
 * Generates password data (salt and hashed password) using the scrypt algorithm.
 * @param {string} password - The password to hash.
 * @returns {Promise<object>} A promise that resolves to an object containing the salt and hashed password.
 */
function generatePasswordData(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(8).toString('hex');
    crypto.scrypt(password, salt, 16, (err, hashedPassword) => {
      if (err) reject(err);
      else resolve({ salt, hash: hashedPassword.toString('hex') });
    });
  });
}

/**
 * Generates password data for all users (teachers and students).
 * Each teacher has a fixed password, students share a common password.
 */
async function generateAllPasswords() {
  // Teachers
  const teachers = [
    { name: 'Mario Rossi', email: 'mario.rossi@polito.it', password: 'password123' },
    { name: 'Anna Verdi', email: 'anna.verdi@polito.it', password: 'password456' }
  ];

  for (const teacher of teachers) {
    await generatePasswordData(teacher.password);
  }

  // Students
  const students = [
    'giulia.bianchi@studenti.polito.it',
    'marco.ferrari@studenti.polito.it',
    'laura.russo@studenti.polito.it',
    'alessandro.bruno@studenti.polito.it',
    'francesca.romano@studenti.polito.it',
    'davide.ricci@studenti.polito.it',
    'chiara.marino@studenti.polito.it',
    'luca.greco@studenti.polito.it',
    'valentina.conti@studenti.polito.it',
    'simone.deluca@studenti.polito.it',
    'elena.galli@studenti.polito.it',
    'matteo.lombardi@studenti.polito.it',
    'sara.moretti@studenti.polito.it',
    'andrea.barbieri@studenti.polito.it',
    'martina.fontana@studenti.polito.it',
    'riccardo.serra@studenti.polito.it',
    'federica.vitale@studenti.polito.it',
    'nicola.pellegrini@studenti.polito.it',
    'roberta.caruso@studenti.polito.it',
    'stefano.fiore@studenti.polito.it',
    'alessia.desantis@studenti.polito.it',
    'emanuele.marini@studenti.polito.it'
  ];

  for (const email of students) {
    await generatePasswordData('student123');
  }
}

generateAllPasswords().catch(() => {});
