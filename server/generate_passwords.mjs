import crypto from 'crypto';

/**
 * Generates password data (salt and hashed password) using the scrypt algorithm.
 * @param {string} password - The password to hash.
 * @returns {Promise<object>} A promise that resolves to an object containing the salt and hashed password.
 * @throws {Error} If there is an error during the hashing process.
 */
function generatePasswordData(password) {
  return new Promise((resolve, reject) => {
    // Generate random salt
    const salt = crypto.randomBytes(8).toString('hex');
    
    // Hash password with salt using scrypt
    crypto.scrypt(password, salt, 16, (err, hashedPassword) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          salt: salt,
          hash: hashedPassword.toString('hex')
        });
      }
    });
  });
}

/**
 * Generates password data for all users (teachers and students).
 * This function generates password data for two teachers and a list of students.
 * Each teacher has a fixed password, while students have a common password.
 * @returns {Promise<void>} A promise that resolves when all password data has been generated.
 * @throws {Error} If there is an error during the password generation process.
 */
async function generateAllPasswords() {
  
  // Teachers
  const teacher1 = await generatePasswordData('password123');
  const teacher2 = await generatePasswordData('password123');
  
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
    const studentData = await generatePasswordData('student123');
  }
  
  let studentIndex = 0;
  for (const email of students) {
    const studentData = await generatePasswordData('student123');
  }
}

generateAllPasswords().catch(console.error);
