import { useState } from 'react';
import axios from 'axios';
import { getAuthToken } from '../utils/auth';

function Contact() {
  const [formData, setFormData] = useState({
    type: 'question',
    name: '',
    phone_number: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!formData.message.trim()) {
        throw new Error('Veuillez entrer un message.');
      }
      if (!formData.email && !formData.phone_number) {
        throw new Error('Veuillez entrer un email ou un numéro de téléphone pour que nous puissions vous répondre.');
      }

      const token = await getAuthToken();
      const serverUrl = process.env.NODE_ENV === 'production' ? 'https://marchenet-server.onrender.com/api' : 'http://localhost:3001/api';
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data: userData } = token ? await axios.get(`${serverUrl}/auth/check`, { headers }) : { data: { user: { id: null } } };
      const userId = userData.user?.id || null;

      await axios.post(`${serverUrl}/messages`, {
        user_id: userId,
        type: formData.type,
        name: formData.name || null,
        phone_number: formData.phone_number || null,
        email: formData.email || null,
        message: formData.message,
      }, { headers });

      setSuccess(
        formData.type === 'complaint'
          ? 'Votre plainte a été envoyée. Nous vous répondrons bientôt.'
          : 'Votre message a été envoyé. Merci de nous avoir contactés !'
      );
      setFormData({
        type: 'question',
        name: '',
        phone_number: '',
        email: '',
        message: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Une erreur est survenue lors de l’envoi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4 font-poppins">
        <span className="text-black">MarchéNet</span>{' '}
        <span className="text-orange-500">Afrique</span> - Nous contacter
      </h2>
      <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 font-opensans mb-4">
          Téléphone :{' '}
          <a href="tel:+221771463012" className="text-blue-500 hover:underline">
            +221 77 123 45 67
          </a>
        </p>
        <p className="text-gray-600 font-opensans mb-4">
          Pour toute question ou plainte, utilisez le formulaire ci-dessous.
        </p>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 font-opensans">
              Type de message
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-200"
            >
              <option value="question">Question / Support</option>
              <option value="complaint">Plainte</option>
            </select>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-opensans">
              Votre nom
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Entrez votre nom"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-200"
            />
          </div>
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 font-opensans">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Entrez votre numéro (ex: +221 77 123 45 67)"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-200"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-opensans">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Entrez votre email"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-200"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 font-opensans">
              Votre message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-200"
              placeholder="Décrivez votre question ou plainte..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:bg-gray-400"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contact;