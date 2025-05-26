import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, updateProduct } from '../api/products';
import { useAuth } from '../context/AuthContext';

function EditProduct() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    countries: [],
    newImages: [],
    photo_urls: [],
    stock_status: 'disponible',
    condition: 'neuf',
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState({});
  const [hasDependencies, setHasDependencies] = useState(false);
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
    { name: "Sénégal", code: "SN" }, { name: "Mali", code: "ML" }, { name: "Côte d'Ivoire", code: "CI" },
    { name: "Guinée", code: "GN" }, { name: "Burkina Faso", code: "BF" }, { name: "Togo", code: "TG" },
    { name: "Bénin", code: "BJ" }, { name: "Cameroun", code: "CM" },
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const product = (await getProductById(id)).data;

        // Normaliser photo_urls en tableau plat
        const normalizedPhotoUrls = Array.isArray(product.photo_urls) && product.photo_urls.length > 0 && Array.isArray(product.photo_urls[0])
          ? product.photo_urls.flat()
          : product.photo_urls || [];
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          category: product.category,
          stock: product.stock.toString(),
          countries: product.countries || [],
          photo_urls: normalizedPhotoUrls,
          stock_status: product.stock_status || 'disponible',
          condition: product.condition || 'neuf',
          newImages: [],
        });
        setImagePreviews(normalizedPhotoUrls.map(url => url));

        // Vérifier les dépendances dans favorites et cart (simulé via API si implémenté)
        const [favoritesResp, cartResp] = await Promise.all([
          axios.get(`/favorites?product_id=${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`/cart?product_id=${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if ((favoritesResp.data.length > 0) || (cartResp.data.length > 0)) {
          setHasDependencies(true);
        }
      } catch (err) {
        setError(err.response?.data?.error || "Erreur lors de la récupération du produit.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files) {
      const file = files[0];
      if (formData.photo_urls.length + formData.newImages.length >= 3) {
        setError('Vous ne pouvez sélectionner que 3 images maximum.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`L’image ${file.name} doit être inférieure à 5 Mo.`);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(`L’image ${file.name} doit être au format JPEG, PNG ou WebP.`);
        return;
      }
      const newImages = [...formData.newImages, file];
      setFormData({ ...formData, newImages });
      setImagePreviews([...imagePreviews, URL.createObjectURL(file)]);
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
    if (index < formData.photo_urls.length) {
      const newPhotoUrls = formData.photo_urls.filter((_, i) => i !== index);
      setFormData({ ...formData, photo_urls: newPhotoUrls });
      setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    } else {
      const newIndex = index - formData.photo_urls.length;
      const newImages = formData.newImages.filter((_, i) => i !== newIndex);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setFormData({ ...formData, newImages });
      setImagePreviews(newPreviews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const priceValue = parseInt(formData.price, 10);
      if (isNaN(priceValue) || priceValue <= 0) throw new Error("Le prix doit être un nombre entier positif.");

      let updatedPhotoUrls = [...formData.photo_urls];
      for (let i = 0; i < formData.newImages.length; i++) {
        const file = formData.newImages[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${token.split('.')[1]}-${i}.${fileExt}`; // Utilise une partie du token comme ID utilisateur
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        const response = await axios.post('/upload', formDataUpload, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (event) => {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress((prev) => ({ ...prev, [fileName]: progress }));
          },
        });
        updatedPhotoUrls.push(response.data.url); // Assume que le backend renvoie l'URL publique
      }

      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: priceValue,
        category: formData.category,
        stock: parseInt(formData.stock),
        photo_urls: updatedPhotoUrls,
        countries: formData.countries,
        stock_status: formData.stock_status,
        condition: formData.condition,
      };

      await updateProduct(id, updateData);

      setSuccess("Produit mis à jour avec succès !");
      setTimeout(() => navigate('/tableau-de-bord'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
      setUploadProgress({});
    }
  };

  useEffect(() => {
    document.title = 'Modifier un Produit | MarchéNet Afrique';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `Modifiez les détails de votre produit sur MarchéNet Afrique, votre plateforme e-commerce africaine.`);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = `Modifiez les détails de votre produit sur MarchéNet Afrique, votre plateforme e-commerce africaine.`;
      document.head.appendChild(meta);
    }
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'modifier produit, e-commerce, MarchéNet Afrique, boutique en ligne');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = 'modifier produit, e-commerce, MarchéNet Afrique, boutique en ligne';
      document.head.appendChild(meta);
    }
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-600 text-lg">Chargement...</p>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl transform transition-all hover:shadow-3xl">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 font-poppins">
            Modifier un produit
          </h2>
          <p className="mt-3 text-lg text-gray-600 font-opensans">
            Modifiez les informations de votre produit.
          </p>
        </div>
        {hasDependencies && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg">
            <p>Ce produit est dans des favoris ou un panier. Les utilisateurs seront notifiés si le produit devient indisponible.</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-lg shadow-lg max-w-md text-center">
              <span>{success}</span>
            </div>
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom du produit
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition duration-200"
                placeholder="Nom du produit"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition duration-200"
                placeholder="Description du produit"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition duration-200 [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                placeholder="Prix du produit (exemple : 19999)"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Catégorie
              </label>
              <select
                id="category"
                name="category"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition duration-200"
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
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition duration-200 [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                placeholder="Quantité en stock"
                value={formData.stock}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="stock_status" className="block text-sm font-medium text-gray-700">
                Statut du stock
              </label>
              <select
                id="stock_status"
                name="stock_status"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition duration-200"
                value={formData.stock_status}
                onChange={handleChange}
              >
                <option value="disponible">Disponible</option>
                <option value="epuise">Épuisé</option>
              </select>
            </div>
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                État du produit
              </label>
              <select
                id="condition"
                name="condition"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition duration-200"
                value={formData.condition}
                onChange={handleChange}
              >
                <option value="neuf">Neuf</option>
                <option value="occasion">Occasion</option>
              </select>
            </div>
            <div>
              <label htmlFor="countries" className="block text-sm font-medium text-gray-700">
                Pays de disponibilité
              </label>
              <select
                id="countries"
                name="countries"
                multiple
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition duration-200"
                value={formData.countries}
                onChange={handleChange}
              >
                {countriesList.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="newImages" className="block text-sm font-medium text-gray-700">
                Nouvelles images (max 3 au total)
              </label>
              <input
                id="newImages"
                name="newImages"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={handleChange}
              />
              {imagePreviews.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Image ${index + 1}`}
                        className="w-full h-auto max-h-32 object-contain rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                      >
                        x
                      </button>
                      {(index >= formData.photo_urls.length && uploadProgress[formData.newImages[index - formData.photo_urls.length]?.name]) && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress[formData.newImages[index - formData.photo_urls.length]?.name]}%` }}
                          ></div>
                        </div>
                      )}
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 disabled:bg-gray-400"
            >
              {loading ? "Mise à jour en cours..." : "Mettre à jour le produit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;