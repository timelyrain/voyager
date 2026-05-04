export interface BourdainEntry {
  food: string
  quote: string
}

export const BOURDAIN_COUNTRIES: Record<string, BourdainEntry> = {
  AR: {
    food: 'Asado, Empanadas, Chimichurri, Offal cuts',
    quote: 'He treated Argentine asado as a "near-religious experience" and loved the purity of the fire.',
  },
  BR: {
    food: 'Mortadella sandwich, Tacacá',
    quote: 'He famously wrestled with a massive mortadella sandwich on camera in São Paulo.',
  },
  CA: {
    food: 'Poutine, Foie Gras, Montreal-style bagels',
    quote: 'He praised the soulful approach to fat at Montreal\'s Au Pied de Cochon.',
  },
  CN: {
    food: 'Sichuan hot pot, Peking duck, Dim sum, Roast goose, Congee',
    quote: 'He was fascinated by the numbing mala flavor of Sichuan hot pot and called roast goose "extraordinary".',
  },
  CG: {
    food: 'Tiger fish (Limboke), Piri Piri chicken',
    quote: 'He admired the honesty of tiger fish steamed in banana leaves.',
  },
  EG: {
    food: 'Ful Medames, Stuffed Pigeon, Kushari',
    quote: 'He loved the simple street cart culture and traditional breakfast of Cairo.',
  },
  ET: {
    food: 'Injera with Doro Wat',
    quote: 'He appreciated the traditional communal dining style.',
  },
  FR: {
    food: 'Steak frites, Omelet, Roast chicken, Sole meunière, Cassoulet',
    quote: 'He called the omelet the "true test of a chef" and cited steak frites as a top "death row meal".',
  },
  DE: {
    food: 'Blutwurst (blood sausage)',
    quote: 'A lifelong advocate for blood sausage, he considered it a favorite in Berlin and Cologne.',
  },
  GH: {
    food: 'Fufu with light soup, Jollof rice, Grilled tilapia with shito',
    quote: 'He deeply engaged with the local culture and the process of pounding fufu.',
  },
  GR: {
    food: 'Grilled whole fish, Lamb on the spit, Spanakopita, Fresh feta',
    quote: 'He adored the simplicity of Greek tavernas: "just fish, salt, lemon, and oil".',
  },
  IS: {
    food: 'Lamb hot dogs',
    quote: 'He praised the unique flavor of lamb-based hot dogs at Bæjarins Beztu Pylsur.',
  },
  IN: {
    food: 'Dosas, Biryani, Street chaat, Dal, Tandoori',
    quote: 'Though he found the country overwhelming, he loved the intensity of street chaat in Mumbai.',
  },
  ID: {
    food: 'Babi guling, Nasi goreng, Satay',
    quote: 'He ranked Balinese Babi Guling among the world\'s greatest pork dishes.',
  },
  IT: {
    food: 'Cacio e Pepe, Roman offal, Pizza Margherita, Bistecca alla Fiorentina',
    quote: 'He worshipped the Roman "fifth quarter" (offal) tradition and was a purist for Neapolitan pizza.',
  },
  JP: {
    food: 'Ramen, Sushi, Yakitori, Tempura, Gyoza, 7-Eleven onigiri',
    quote: 'He called the sushi at Sukiyabashi Jiro the best experience of his life.',
  },
  LB: {
    food: 'Mezze, Kibbeh nayyeh, Fattoush, Grilled meats, Hummus',
    quote: 'He considered Lebanese mezze culture one of the world\'s great traditions and Beirut a top food city.',
  },
  MY: {
    food: 'Sarawak Laksa',
    quote: 'He famously dubbed this dish "The Breakfast of the Gods" while in Kuching.',
  },
  MX: {
    food: 'Tacos al pastor, Carnitas, Mole negro, Cochinita pibil',
    quote: 'Tacos al pastor were a personal obsession, and he called Ensenada street food the "best on earth".',
  },
  MA: {
    food: 'Lamb mechoui, Bastilla, Harira soup, Couscous',
    quote: 'He loved the communal, hand-eaten nature of Moroccan lamb feasts.',
  },
  PE: {
    food: 'Anticuchos, Ceviche, Lomo saltado, Lechón',
    quote: 'He considered Peruvian ceviche world-class and used beef heart to highlight his love for offal.',
  },
  PH: {
    food: 'Cebu Lechon, Sisig, Kare-kare, Balut',
    quote: 'He declared Cebu Lechon "the best pig ever" and called sisig "perfect beer food".',
  },
  PT: {
    food: 'Bifanas, Bacalhau, Pastéis de nata, Grilled sardines',
    quote: 'He loved the simple, garlic-heavy sandwiches at Cervejaria Ramiro in Lisbon.',
  },
  SG: {
    food: 'Hainanese Chicken Rice, White Pepper Crab',
    quote: 'He said the chicken rice at Tian Tian was so good it could be eaten entirely on its own.',
  },
  KR: {
    food: 'Budae Jjigae, Korean BBQ, Kimchi jjigae, Bibimbap',
    quote: 'He loved the "low-brow" brilliance of mixing spam and hot dogs into spicy Budae Jjigae.',
  },
  ES: {
    food: 'Jamón ibérico, Pintxos, Tortilla española, Percebes',
    quote: 'He ranked Jamón ibérico among the finest foods on earth and adored Basque pintxos culture.',
  },
  TH: {
    food: 'Pad kra pao, Boat noodles, Som tam, Khao man gai',
    quote: 'He called Pad kra pao his favorite Thai comfort food and said he could eat it every day.',
  },
  TR: {
    food: 'Kokoreç, Lahmacun, Balık ekmek, Meze, Kebabs',
    quote: 'Grilled lamb intestines (Kokoreç) were noted as being "right in my wheelhouse".',
  },
  GB: {
    food: 'Roast Bone Marrow',
    quote: 'Served at St. John in London, this was his requested "last meal on earth".',
  },
  UY: {
    food: 'The Chivito',
    quote: 'He called this steak and egg sandwich the "greatest sandwich in the history of recorded sandwich-dom".',
  },
  US: {
    food: 'Texas Brisket, NYC Pastrami, Raw oysters, Dirty-water hot dogs, Popeyes Fried Chicken',
    quote: 'He called Texas BBQ brisket one of the "great foods on earth" and admitted to a secret love for Popeyes.',
  },
  VN: {
    food: 'Bún Bò Huế, Bún Chả, Phở, Bánh mì, Cơm tấm',
    quote: 'He cited Bún Bò Huế as the "greatest soup in the world" and his meal with Obama as one of his most memorable.',
  },
}
