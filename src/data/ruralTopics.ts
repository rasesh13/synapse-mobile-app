/**
 * SynapseOS Mobile — Offline Rural Healthcare Educational Guides
 * Reused from RuralHealthPanel
 */

import { RuralTopic } from '../types';

export const RURAL_HEALTH_TOPICS: RuralTopic[] = [
  {
    id: 'ors',
    title: 'ORS & Child Diarrhea Guidance',
    shortTitle: 'ORS & Diarrhea',
    icon: '💧',
    category: 'Dehydration Protocol',
    steps: [
      { title: 'Clean Water Preparation', detail: 'Boil 1 Liter of clean drinking water and let it cool completely to room temperature.' },
      { title: 'WHO Formula Calibration', detail: 'Mix 1 full WHO ORS sachet (or 6 level tsp sugar + 1/2 level tsp salt in 1L water).' },
      { title: 'Frequent Small Sips', detail: 'Administer small frequent sips after every loose stool to prevent dehydration shock.' },
      { title: 'Zinc Supplementation', detail: 'Give 1 Zinc tablet (20mg) daily for 14 consecutive days to heal intestinal lining.' }
    ],
    redFlag: 'Sunken eyes, lethargy, skin pinch goes back very slowly, or unable to drink -> Immediate hospital referral.',
    scheme: 'Free ORS & Zinc packets at all Anganwadi Centres & PHCs'
  },
  {
    id: 'snakebite',
    title: 'Snakebite Immediate First Aid',
    shortTitle: 'Snakebite Protocol',
    icon: '🐍',
    category: 'Emergency Poisoning',
    steps: [
      { title: 'Reassure & Immobilize', detail: 'Keep victim calm and still. Immobilize the bitten limb with a splint below heart level.' },
      { title: 'DO NOT Cut or Suck', detail: 'Never cut, burn, suck venom, or apply tight tourniquets; this causes tissue necrosis.' },
      { title: 'Remove Constricting Items', detail: 'Remove rings, bangles, and tight clothing before swelling starts.' },
      { title: 'Immediate Anti-Snake Venom (ASV)', detail: 'Transport directly to nearest Sub-District Hospital or PHC stocking polyvalent ASV.' }
    ],
    redFlag: 'Bleeding from gums, drooping eyelids (ptosis), difficulty breathing or swallowing -> Dial 108 immediately.',
    scheme: 'National Snakebite Management Protocol — Polyvalent ASV is FREE at all Govt Hospitals'
  },
  {
    id: 'anemia',
    title: 'Maternal Nutrition & Anemia Prevention',
    shortTitle: 'Maternal Anemia',
    icon: '🩸',
    category: 'Maternal & Child Health',
    steps: [
      { title: 'Iron Folic Acid (IFA)', detail: 'Take 1 red IFA tablet daily from the 2nd trimester (after 14 weeks) with water.' },
      { title: 'Avoid Tea/Coffee with Meals', detail: 'Do not take IFA with tea, coffee, or milk; tannins block iron absorption.' },
      { title: 'Iron-Rich Local Foods', detail: 'Eat green leafy vegetables (Palak, Methi), jaggery (Gud), chana, and citrus fruits (Amla, Lemon).' },
      { title: 'Deworming Dose', detail: 'Take 1 Albendazole tablet (400mg) after the first trimester as prescribed by ANM.' }
    ],
    redFlag: 'Extreme breathlessness on mild exertion, severe dizziness, swelling in feet and face (preeclampsia warning).',
    scheme: 'Anemia Mukt Bharat & POSHAN Abhiyaan (Free IFA supplements at Anganwadi)'
  },
  {
    id: 'water',
    title: 'Safe Water Purification & Cholera Defense',
    shortTitle: 'Water Purification',
    icon: '🚰',
    category: 'Waterborne Disease Prevention',
    steps: [
      { title: 'Rolling Boil for 1 Minute', detail: 'Bring water to a rolling boil for at least 1 full minute to kill bacteria, cysts, and viruses.' },
      { title: 'Chlorine Tablet Dosage', detail: 'Use 1 Halazone/Chlorine tablet (0.5g) per 20 Liters of water; wait 30 minutes before drinking.' },
      { title: 'Covered Storage Containers', detail: 'Store drinking water in narrow-mouthed earthen or steel pots with taps; do not dip hands.' },
      { title: 'Hand Hygiene Before Meals', detail: 'Wash hands thoroughly with soap and water before cooking, eating, and after using toilets.' }
    ],
    redFlag: 'Rice-water watery diarrhea with vomiting leading to rapid collapse -> Rush for IV fluids immediately.',
    scheme: 'Jal Jeevan Mission & Swachh Bharat Gramin Community Testing'
  },
  {
    id: 'heatstroke',
    title: 'Heatstroke (Loo) Protection & Relief',
    shortTitle: 'Heatstroke / Loo',
    icon: '☀️',
    category: 'Extreme Weather Safety',
    steps: [
      { title: 'Avoid Peak Sun (11 AM – 4 PM)', detail: 'Stay indoors or in shade during maximum heat hours; wear loose light cotton clothes.' },
      { title: 'Traditional Hydration Drinks', detail: 'Drink Aam Panna (raw mango drink), Chaas (buttermilk), coconut water, or lemon water regularly.' },
      { title: 'Cold Water Sponge', detail: 'If body temperature spikes, immediately move to cool shade, apply wet cloths to neck and armpits.' },
      { title: 'Fan Air Circulation', detail: 'Fan continuously while misting water on the skin to induce rapid evaporative cooling.' }
    ],
    redFlag: 'High fever (> 104°F) with absence of sweating, confusion, delirium, or unconsciousness -> Critical Emergency!',
    scheme: 'National Heat Action Plan (NDMA guidelines)'
  },
  {
    id: 'tb_dots',
    title: 'Tuberculosis (TB) Early Signs & DOTS Care',
    shortTitle: 'TB & Cough Care',
    icon: '🫁',
    category: 'Infectious Disease Care',
    steps: [
      { title: 'Cough for 2+ Weeks Screening', detail: 'Any cough lasting more than 2 weeks must be tested via Sputum Microscopy or CB-NAAT.' },
      { title: 'FREE Testing & Treatment', detail: 'Diagnostic tests and anti-TB medications are 100% free under National TB Elimination Program.' },
      { title: 'Nikshay Poshan Nutritional Direct Benefit', detail: 'All notified TB patients receive ₹500/month directly into bank accounts for high-protein food.' },
      { title: 'Never Stop Medicine Early', detail: 'Complete the full 6-month course even if symptoms disappear, to avoid drug-resistant MDR-TB.' }
    ],
    redFlag: 'Coughing up blood (hemoptysis), unexplained weight loss, night sweats, high persistent evening fever.',
    scheme: 'Ni-kshay Poshan Yojana (NTEP) — Direct ₹500/month DBT support'
  }
];
