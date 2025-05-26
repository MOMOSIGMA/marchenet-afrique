import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addProduct } from '../api/products';

function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    countries: [],
    images: [],
    stock_status: 'disponible',
    condition: 'neuf',
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { user, isVendor } = useAuth();
  const navigate = useNavigate();

  const categories = [
    'Accessoires de mode', 'Agriculture et élevage', 'Alimentation et boissons', 'Ameublement et décoration',
    'Art et artisanat', 'Articles pour bébés', 'Automobile et motos', 'Beauté et cosmétiques', 'Bijoux et montres',
    'Bureautique et papeterie', 'Chaussures', 'Éducation et formation', 'Électroménager', 'Électronique',
    'Énergie et solaire', 'Équipements industriels', 'Équipements médicaux', 'Instruments de musique',
    'Jardinage et plantes', 'Jeux et jouets', 'Livres et magazines', 'Maison et cuisine', 'Matériaux de construction',
    'Mode enfant', 'Mode femme', 'Mode homme', 'Prêt-à-porter', 'Produits culturels', 'Santé et bien-être',
    'Services et prestations', 'Sport et loisirs', 'Téléphones', 'Téléphonie et accessoires', 'Textiles et tissus',
    'Voyage et bagages',
  ].sort();

  const countriesList = [
    { name: 'Sénégal', code: 'SN' }, { name: 'Mali', code: 'ML' }, { name: 'Côte d\'Ivoire', code: 'CI' },
    { name: 'Guinée', code: 'GN' }, { name: 'Burkina Faso', code: 'BF' }, { name: 'Togo', code: 'TG' },
    { name: 'Bénin', code: 'BJ' }, { name: 'Cameroun', code: 'CM' },
  ];

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate('/connexion');
      return;
    }
    if (isAuthenticated && (!user?.isVendor && user?.role !== 'vendor')) {
      navigate('/devenir-vendeur');
      return;
    }
    if (user?.vendorData && user.vendorData.is_store_active === false) {
      setError('Votre boutique est désactivée. Veuillez renouveler votre abonnement.');
      setTimeout(() => navigate('/devenir-vendeur'), 3000);
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files) {
      const newFiles = Array.from(files);
      const totalImages = formData.images.length + newFiles.length;

      if (totalImages > 3) {
        setError(`Vous ne pouvez sélectionner que ${3 - formData.images.length} image(s) supplémentaire(s). Maximum 3 images au total.`);
        return;
      }

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        if (file.size > 5 * 1024 * 1024) {
          setError(`L’image ${file.name} doit être inférieure à 5 Mo.`);
          return;
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          setError(`L’image ${file.name} doit être au format JPEG, PNG ou WebP.`);
          return;
        }
      }

      const updatedImages = [...formData.images, ...newFiles];
      const updatedPreviews = [...imagePreviews, ...newFiles.map(file => URL.createObjectURL(file))];
      setFormData({ ...formData, images: updatedImages });
      setImagePreviews(updatedPreviews);
      setError(null);
    } else if (name === 'countries') {
      const selectedCountries = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData({ ...formData, countries: selectedCountries });
    } else if (name === 'price' || name === 'stock') {
      const isValidInteger = /^[0-9]*$/.test(value);
      if (!isValidInteger && value !== '') {
        setError(`Veuillez entrer un ${name === 'price' ? 'prix' : 'stock'} sans espaces, points ou virgules (ex. 19999).`);
        return;
      }
      setError(null);
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.name.trim()) return setError('Le nom du produit est requis.');
    if (!formData.description.trim()) return setError('La description est requise.');
    if (!formData.price || parseInt(formData.price) <= 0) return setError('Le prix doit être un nombre positif.');
    if (!formData.category) return setError('Veuillez sélectionner une catégorie.');
    if (!formData.stock || parseInt(formData.stock) < 0) return setError('Le stock doit être un nombre positif ou nul.');
    if (formData.countries.length === 0) return setError('Veuillez sélectionner au moins un pays.');
    if (formData.images.length === 0) return setError('Veuillez sélectionner au moins une image.');
    if (!formData.condition) return setError('Veuillez sélectionner l’état du produit.');
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', parseInt(formData.price));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', parseInt(formData.stock));
      formDataToSend.append('countries', JSON.stringify(formData.countries));
      formDataToSend.append('stock_status', formData.stock_status);
      formDataToSend.append('condition', formData.condition);
      // Récupère le vendor_id depuis le contexte user
      formDataToSend.append('vendor_id', user?.vendorData?.id || user?.id);
      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      await addProduct(formDataToSend);

      setSuccess('Produit ajouté avec succès !');
      setTimeout(() => {
        setSuccess(null);
        navigate('/tableau-de-bord');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 font-poppins">
            <span className="block sm:inline text-black">MarchéNet</span>{' '}
            <span className="block sm:inline text-orange-500">Afrique</span>
            <span className="block text-base sm:text-2xl mt-1 sm:mt-0 sm:ml-2">
              - Ajouter un produit
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-lg text-gray-600 font-opensans">
            Remplissez les informations pour ajouter un produit à votre boutique.
          </p>
        </div>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}
        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-opensans">
                Nom du produit
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                placeholder="Nom du produit"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 font-opensans">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                className="mt-1 block w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                placeholder="Description du produit"
                rows="3"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 font-opensans">
                Prix (FCFA)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                inputMode="numeric"
                required
                min="1"
                step="1"
                className="mt-1 block w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                placeholder="Prix du produit (ex. 19999)"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 font-opensans">
                Catégorie
              </label>
              <select
                id="category"
                name="category"
                required
                className="mt-1 block w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 font-opensans">
                Stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                inputMode="numeric"
                required
                min="0"
                step="1"
                className="mt-1 block w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                placeholder="Quantité en stock"
                value={formData.stock}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="stock_status" className="block text-sm font-medium text-gray-700 font-opensans">
                Statut du stock
              </label>
              <select
                id="stock_status"
                name="stock_status"
                className="mt-1 block w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                value={formData.stock_status}
                onChange={handleChange}
              >
                <option value="disponible">Disponible</option>
                <option value="epuise">Épuisé</option>
              </select>
            </div>
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 font-opensans">
                État du produit
              </label>
              <select
                id="condition"
                name="condition"
                required
                className="mt-1 block w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                value={formData.condition}
                onChange={handleChange}
              >
                <option value="neuf">Neuf</option>
                <option value="occasion">Occasion</option>
              </select>
            </div>
            <div>
              <label htmlFor="countries" className="block text-sm font-medium text-gray-700 font-opensans">
                Pays de disponibilité
              </label>
              <select
                id="countries"
                name="countries"
                multiple
                required
                className="mt-1 block w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base max-h-32"
                value={formData.countries}
                onChange={handleChange}
              >
                {countriesList.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1 font-opensans">
                Maintenez la touche Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs pays.
              </p>
            </div>
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 font-opensans">
                Images du produit (max 3)
              </label>
              <div className="mt-1">
                <input
                  id="images"
                  name="images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleChange}
                />
              </div>
              {imagePreviews.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Aperçu ${index + 1}`}
                        className="w-full h-auto max-h-24 object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? "Ajout en cours..." : "Ajouter le produit"}
            </button>
          </div>
        </form>

        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-bold font-poppins">Confirmer l’ajout du produit</h3>
              <p className="mt-2 font-opensans text-sm sm:text-base">
                <strong>Nom :</strong> {formData.name}<br />
                <strong>Prix :</strong> {formData.price} FCFA<br />
                <strong>Catégorie :</strong> {formData.category}<br />
                <strong>État :</strong> {formData.condition === 'neuf' ? 'Neuf' : 'Occasion'}<br />
                <strong>Stock :</strong> {formData.stock}<br />
                <strong>Pays :</strong> {formData.countries.join(', ')}<br />
                <strong>Images :</strong> {formData.images.length} image(s)
              </p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-500 text-white rounded text-sm sm:text-base"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmSubmit}
                  className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded text-sm sm:text-base"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-green-100 p-4 sm:p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m2-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-sm sm:text-base text-green-800 font-opensans">
                {success}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddProduct;