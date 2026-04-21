import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, query, limit } from 'firebase/firestore';

const STAPLE_RECIPES = [
  {
    id: 'jollof-rice',
    title: 'Party Jollof Rice',
    tribe: 'General',
    cookingTime: 60,
    occasion: 'Owambe',
    isPremium: false,
    imageUrl: 'https://images.unsplash.com/photo-1628102431718-cc797b5e40e6?q=80&w=1000&auto=format&fit=crop',
    ingredients: [
      '3 cups Long grain parboiled rice',
      '6 medium sized fresh plum tomatoes',
      '2 Red bell peppers (Tatashe)',
      '3 scotch bonnet peppers (Atarodo)',
      '2 medium sized onions',
      '1 cup vegetable oil',
      'Tomato paste (70g)',
      'Chicken stock (2 cups)',
      'Thyme, Curry powder, Bay leaves',
      'Salt and seasoning cubes'
    ],
    instructions: [
      'Blend the tomatoes, tatashe, atarodo and 1 onion into a smooth paste. Boil until thick.',
      'Heat oil in a pot, fry sliced onions, then add tomato paste and fry for 5 minutes.',
      'Add the boiled tomato mix and fry until oil separates from the mix.',
      'Stir in chicken stock, water, thyme, curry, bay leaves, salt and seasoning. Bring to boil.',
      'Add washed rice, cover with foil and pot lid. Cook on low heat for 45 minutes.',
      'Stir occasionally until softened. The bottom should burn slightly for that "Smoky" flavor!'
    ],
    createdAt: new Date()
  },
  {
    id: 'egusi-soup',
    title: 'Special Egusi Soup',
    tribe: 'Igbo',
    cookingTime: 45,
    occasion: 'Casual',
    isPremium: true,
    imageUrl: 'https://images.unsplash.com/photo-1628102431631-f116a445ec26?q=80&w=1000&auto=format&fit=crop',
    ingredients: [
      '2 cups Melon seeds (Egusi) ground',
      'Assorted meat (Beef, Tripe, Ponmo)',
      'Dry fish and Stockfish',
      '1/2 cup Palm oil',
      'Ground crayfish (3 tbsp)',
      'Pepper and onions',
      'Spinach or Bitter leaf',
      'Salt and seasoning cubes'
    ],
    instructions: [
      'Boil the meats and stockfish until tender, reserving the stock.',
      'Mix ground egusi with a little water to form a thick paste. Peel and slice onions.',
      'Heat palm oil in a pot, add onions, then add egusi balls. Fry for 10 minutes until golden.',
      'Stir in meat stock, crayfish and pepper. Cover and simmer for 15 minutes.',
      'Add boiled meat and fish. Cook for another 10 minutes.',
      'Add shredded vegetables and turn off heat after 2 minutes.'
    ],
    createdAt: new Date()
  },
  {
    id: 'efo-riro',
    title: 'Efo Riro (Vegetable Soup)',
    tribe: 'Yoruba',
    cookingTime: 40,
    occasion: 'Owambe',
    isPremium: true,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop',
    ingredients: [
      '4 bunches of Shoko or Tete leaves',
      'Assorted meat and Snail',
      'Palm oil (1.5 cups)',
      'Ground locust beans (Iru)',
      'Tatase/Atarodo/Onion blend (coarse)',
      'Smoked fish',
      'Seasoning and Salt'
    ],
    instructions: [
      'Parboil meat and snails with spices until soft.',
      'Wash and blanch vegetable leaves in hot water for 3 minutes, then squeeze out water.',
      'Heat palm oil, fry Iru for 1 minute, then add the coarse pepper blend.',
      'Fry until the water evaporates and the base is thick.',
      'Add meat, stock, and smoked fish. Cook for 5 minutes.',
      'Add the vegetables, stir well, and simmer for another 3 minutes.'
    ],
    createdAt: new Date()
  }
];

const MOCK_TRANSACTIONS = [
  { amount: 2500, status: 'success', reference: 'T-1001', userId: 'user_1', createdAt: new Date(Date.now() - 86400000 * 5) },
  { amount: 2500, status: 'success', reference: 'T-1002', userId: 'user_2', createdAt: new Date(Date.now() - 86400000 * 4) },
  { amount: 2500, status: 'pending', reference: 'T-1003', userId: 'user_3', createdAt: new Date(Date.now() - 86400000 * 3) },
  { amount: 5000, status: 'success', reference: 'T-1004', userId: 'user_4', createdAt: new Date(Date.now() - 86400000 * 2) },
  { amount: 2500, status: 'success', reference: 'T-1005', userId: 'user_5', createdAt: new Date(Date.now() - 86400000 * 1) },
];

export async function seedBaseData() {
  try {
    const recipesCol = collection(db, 'recipes');
    const q = query(recipesCol, limit(1));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      console.log("Seeding base recipes...");
      for (const recipe of STAPLE_RECIPES) {
        await setDoc(doc(db, 'recipes', recipe.id), recipe);
      }

      console.log("Seeding mock transactions...");
      for (const t of MOCK_TRANSACTIONS) {
        await setDoc(doc(db, 'transactions', t.reference), t);
      }
    }
  } catch (error) {
    console.warn("Seed failed (likely permission denied):", error);
  }
}
