// BecomeVendor.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext'; // <-- Correction ici

function BecomeVendor() {
  const { isAuthenticated, user, error: authError } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vendorName: '',
    shopName: '',
    address: '',
    country: 'Sénégal',
    dialCode: '+221',
    phoneNumber: '',
    email: '',
    vendorCode: '',
  });
  const [selectedPack, setSelectedPack] = useState(null);
  const [error, setError] = useState(authError || null);
  const [success, setSuccess] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExistingVendor, setIsExistingVendor] = useState(false);
  const navigate = useNavigate();

  const countries = [
    { name: 'Sénégal', code: 'SN', dialCode: '+221' },
    { name: 'Mali', code: 'ML', dialCode: '+223' },
    { name: "Côte d'Ivoire", code: 'CI', dialCode: '+225' },
    { name: 'Guinée', code: 'GN', dialCode: '+224' },
    { name: 'Burkina Faso', code: 'BF', dialCode: '+226' },
    { name: 'Togo', code: 'TG', dialCode: '+228' },
    { name: 'Bénin', code: 'BJ', dialCode: '+229' },
  ];

  const packs = [
    { name: 'Pack Gratuit', price: 0, durationDays: 30, quota: 2, color: 'border-green-500', description: 'Pour débuter avec un quota limité.', benefits: ['2 produits max', 'Visibilité locale'] },
    { name: 'Pack Basique', price: 5000, durationDays: 30, quota: 10, color: 'border-blue-500', description: 'Idéal pour les petites boutiques.', benefits: ['10 produits', 'Support prioritaire'] },
    { name: 'Pack Pro', price: 15000, durationDays: 90, quota: 25, color: 'border-purple-500', description: 'Pour les vendeurs ambitieux.', benefits: ['25 produits', 'Statistiques avancées'] },
    { name: 'Pack VIP', price: 30000, durationDays: 180, quota: Infinity, color: 'border-red-500', description: 'Pour les pros du commerce.', benefits: ['Produits illimités', 'Promotion spéciale'] },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/connexion');
      return;
    }

    const fetchVendorStatus = async () => {
      try {
        const { data: vendor } = await api.get('/vendors/me');
        if (vendor && vendor.is_store_active) {
          setSuccess('Vous êtes déjà vendeur ! Redirection vers votre tableau de bord...');
          setTimeout(() => navigate('/tableau-de-bord'), 5000);
        } else if (vendor && !vendor.is_store_active) {
          setIsExistingVendor(true);
          setFormData({
            vendorName: vendor.vendor_name || '',
            shopName: vendor.shop_name || '',
            address: vendor.address || '',
            country: vendor.country || 'Sénégal',
            dialCode: countries.find(c => c.name === (vendor.country || 'Sénégal'))?.dialCode || '+221',
            phoneNumber: vendor.phone_number ? vendor.phone_number.replace(/^\+\d+/, '') : '',
            email: vendor.email || '',
            vendorCode: vendor.vendor_code || '',
          });
          setStep(2);
        }
      } catch (err) {
        setError('Erreur lors de la vérification : ' + (err.response?.data?.error || err.message));
      }
    };
    fetchVendorStatus();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'country') {
      const selectedCountry = countries.find(c => c.name === value);
      setFormData({ ...formData, country: value, dialCode: selectedCountry.dialCode });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setError(null);
    if (step === 1) {
      if (!formData.vendorName || !formData.shopName || !formData.address || !formData.phoneNumber || !formData.email) {
        setError('Veuillez remplir tous les champs.');
        return;
      }
      const prefix = 'VEND-';
      const random = Math.random().toString(36).substr(2, 8).toUpperCase();
      setFormData(prev => ({ ...prev, vendorCode: `${prefix}${random}` }));
      setSuccess('Informations enregistrées ! Choisissez un pack.');
      setStep(2);
    }
  };

  const handlePackSelection = async (pack) => {
    setSelectedPack(pack);
    try {
      if (!isAuthenticated) throw new Error('Utilisateur non connecté.');

      if (pack.name === 'Pack Gratuit') {
        await api.post('/vendors', {
          vendor_name: formData.vendorName,
          shop_name: formData.shopName,
          address: formData.address,
          country: formData.country,
          phone_number: `${formData.dialCode}${formData.phoneNumber}`,
          email: formData.email,
          vendor_code: formData.vendorCode,
          current_plan: pack.name,
          subscription_end_date: null,
          quota_limit: pack.quota,
          is_store_active: true,
        });
        setSuccess(`Félicitations, ${formData.vendorName} ! Votre boutique "${formData.shopName}" est prête. Redirection...`);
        setTimeout(() => navigate('/tableau-de-bord'), 5000);
      } else {
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de la sélection.');
    }
  };

  const handlePayment = async () => {
    if (!selectedPack || selectedPack.price === 0) {
      setError('Aucun pack payant sélectionné.');
      return;
    }
    try {
      if (!isAuthenticated) throw new Error('Utilisateur non connecté.');
      const response = await api.post('/payments/create', {
        amount: selectedPack.price,
        description: `Paiement pour le ${selectedPack.name} - ${formData.shopName}`,
        customer: { name: formData.vendorName, email: formData.email, phone: formData.phoneNumber },
        return_url: `${window.location.origin}/mon-profil`,
        callback_url: `${window.location.origin}/mon-profil`,
      });
      if (response.data.success && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error(response.data.message || 'Échec du paiement');
      }
    } catch (error) {
      setError('Erreur paiement : ' + (error.response?.data?.message || error.message));
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 font-poppins">Rejoignez MarchéNet Afrique</h2>
          <p className="mt-3 text-lg text-gray-600 font-opensans">
            {step === 1 ? "Remplissez vos informations" : step === 2 ? "Choisissez un pack" : "Finalisez le paiement"}
          </p>
        </div>
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">{error}</div>}
        {showSuccess && success && (
          <div className="fixed top-0 left-0 right-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-lg shadow-lg max-w-md text-center">
              {success}
            </div>
          </div>
        )}
        {step === 1 && !isExistingVendor && (
          <form className="space-y-6" onSubmit={handleNext}>
            <div className="space-y-4">
              <div><input name="vendorName" placeholder="Nom complet" value={formData.vendorName} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-green-500" required /></div>
              <div><input name="shopName" placeholder="Nom de la boutique" value={formData.shopName} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-green-500" required /></div>
              <div><input name="address" placeholder="Adresse" value={formData.address} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-green-500" required /></div>
              <div>
                <select name="country" value={formData.country} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-green-500" required>
                  {countries.map((c) => <option key={c.code} value={c.name}>{c.name} ({c.dialCode})</option>)}
                </select>
              </div>
              <div className="flex">
                <span className="inline-flex items-center px-4 py-3 bg-gray-50 border-r-0 border rounded-l-lg">{formData.dialCode}</span>
                <input name="phoneNumber" placeholder="Numéro" value={formData.phoneNumber} onChange={handleChange} className="w-full p-3 border rounded-r-lg focus:ring-green-500" required />
              </div>
              <div><input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-green-500" required /></div>
            </div>
            <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700">Continuer</button>
          </form>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center text-gray-800">Choisissez votre pack</h3>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              {packs.map((pack) => (
                <div key={pack.name} className={`border-l-4 ${pack.color} p-6 rounded-lg shadow-lg hover:shadow-xl cursor-pointer`} onClick={() => handlePackSelection(pack)}>
                  <h4 className="text-xl font-semibold">{pack.name}</h4>
                  <p className="mt-2 text-gray-600">{pack.description}</p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">{pack.benefits.map((b, i) => <li key={i} className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>{b}</li>)}</ul>
                  <p className="mt-4 text-lg font-bold">{pack.price} FCFA</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6 text-center">
            <h3 className="text-2xl font-bold text-gray-800">Finalisez votre inscription</h3>
            <p className="text-gray-600">Vous avez choisi le <strong>{selectedPack.name}</strong> pour {selectedPack.price} FCFA.</p>
            <p className="text-sm text-gray-500">Payez via PayDunya.</p>
            <button onClick={handlePayment} className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">Payer avec PayDunya</button>
            <button onClick={() => setStep(2)} className="w-full border p-3 rounded-lg text-gray-700 hover:bg-gray-50">Retour</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BecomeVendor;