// Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Register({ setIsAuthenticated }) {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const countryOptions = [
    { name: 'Sénégal', code: 'SN', phone: '+221', length: 9 },
    { name: 'Mali', code: 'ML', phone: '+223', length: 8 },
    { name: 'Côte d\'Ivoire', code: 'CI', phone: '+225', length: 10 },
    { name: 'Guinée', code: 'GN', phone: '+224', length: 9 },
    { name: 'Burkina Faso', code: 'BF', phone: '+226', length: 8 },
    { name: 'Togo', code: 'TG', phone: '+228', length: 8 },
    { name: 'Bénin', code: 'BJ', phone: '+229', length: 8 },
    { name: 'Cameroun', code: 'CM', phone: '+237', length: 9 },
  ];

  const getCountryCode = () => {
    const selectedCountry = countryOptions.find((c) => c.code === country);
    return selectedCountry ? selectedCountry.phone : '';
  };

  const getCountryLength = () => {
    const selectedCountry = countryOptions.find((c) => c.code === country);
    return selectedCountry ? selectedCountry.length : 0;
  };

  const validatePhone = (phone, length) => {
    return phone.length === length && /^\d+$/.test(phone);
  };

  const checkPasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length >= minLength && hasUpperCase && hasDigit && hasSymbol) return 'Robuste';
    if (password.length >= minLength && (hasUpperCase || hasDigit || hasSymbol)) return 'Moyen';
    return 'Faible';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    if (!country) {
      setError('Veuillez sélectionner un pays.');
      setLoading(false);
      return;
    }

    const requiredLength = getCountryLength();
    if (!validatePhone(phoneNumber, requiredLength)) {
      setError(`Le numéro de téléphone doit contenir exactement ${requiredLength} chiffres pour ${country}.`);
      setLoading(false);
      return;
    }

    const fullPhoneNumber = `${getCountryCode()}${phoneNumber}`;

    // AJOUTE CE LOG :
    console.log("Données envoyées à l'API :", {
      email,
      password,
      last_name: lastName,
      first_name: firstName,
      phone_number: fullPhoneNumber,
      country,
    });

    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        last_name: lastName,
        first_name: firstName,
        phone_number: fullPhoneNumber,
        country,
      });

      const { token } = response.data;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setSuccess('Inscription réussie !');
      setTimeout(() => navigate('/mon-profil'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 text-center font-poppins text-orange-600">Inscription</h2>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-lg shadow-lg max-w-md text-center">
              <span className="block sm:inline">{success}</span>
            </div>
          </div>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-opensans mb-2" htmlFor="lastName">
              Nom
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2 border rounded-lg font-opensans focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-opensans mb-2" htmlFor="firstName">
              Prénom
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2 border rounded-lg font-opensans focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-opensans mb-2" htmlFor="country">
              Pays
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-2 border rounded-lg font-opensans focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Sélectionnez un pays</option>
              {countryOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-opensans mb-2" htmlFor="phoneNumber">
              Numéro de téléphone
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border rounded-l-lg bg-gray-200 text-gray-700 font-opensans">
                {getCountryCode() || '+XXX'}
              </span>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2 border rounded-r-lg font-opensans focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-opensans mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-lg font-opensans focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-opensans mb-2" htmlFor="password">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-lg font-opensans focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                )}
              </button>
            </div>
            <p className="text-sm mt-1">
              Robustesse :{' '}
              <span className={
                checkPasswordStrength(password) === 'Robuste' ? 'text-green-600' :
                checkPasswordStrength(password) === 'Moyen' ? 'text-yellow-600' :
                'text-red-600'
              }>
                {checkPasswordStrength(password)}
              </span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un symbole (ex. !@#).
            </p>
          </div>
          <div>
            <label className="block text-gray-700 font-opensans mb-2" htmlFor="confirmPassword">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded-lg font-opensans focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-800"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white p-2 rounded-lg font-opensans font-semibold hover:bg-orange-600 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>
        <p className="mt-4 text-center font-opensans text-gray-600">
          Déjà un compte ? <Link to="/connexion" className="text-orange-500 hover:underline">Connectez-vous</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;