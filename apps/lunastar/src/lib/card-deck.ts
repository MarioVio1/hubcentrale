// Card deck for Joking Hazard style game
// Categories: dark, absurd, surreal, crude

export interface ComicCard {
  id: string
  text: string
  panel: number
  type: 'setup' | 'punchline'
  category: 'dark' | 'absurd' | 'surreal' | 'crude' | 'normal'
  imagePrompt: string
  imageUrl?: string
}

// Setup Cards (60 cards) - Italian
export const SETUP_CARDS: ComicCard[] = [
  // === DARK HUMOR SETUP CARDS ===
  {
    id: 'setup-1',
    text: 'Il funerale della nonna era tristissimo…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Simple cartoon stick figure funeral scene, black and white, coffin in center, sad stick figures in black clothes, exaggerated sad expressions, comic panel style, flat colors'
  },
  {
    id: 'setup-2',
    text: 'Il medico ha detto «è terminale».',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Simple cartoon doctor holding clipboard with serious expression, stick figure patient looking worried, hospital room background, comic panel style, flat colors'
  },
  {
    id: 'setup-3',
    text: 'Ho beccato il mio ragazzo a tradirmi…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Stick figure opening bedroom door with shocked expression, silhouette of two figures in bed, dramatic lighting, comic panel style'
  },
  {
    id: 'setup-4',
    text: 'Quando il ginecologo ha detto «è un maschio»…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Cartoon doctor holding ultrasound, pregnant stick figure on examination table, doctor pointing at screen, comic panel style'
  },
  {
    id: 'setup-5',
    text: 'Mamma, perché papà piange in cantina?',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Small stick figure child asking mother, basement door in background with crying sounds, dark hallway, comic panel style'
  },
  {
    id: 'setup-6',
    text: 'Il tuo gatto è sparito. Abbiamo trovato…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Two stick figures, one holding missing poster with cat photo, other figure with serious expression, neighborhood background'
  },
  {
    id: 'setup-7',
    text: 'Ho raccontato al terapista la mia infanzia…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Stick figure patient on therapy couch, therapist with notepad looking increasingly horrified, office setting, comic style'
  },
  {
    id: 'setup-8',
    text: 'Mi ha detto «hai sei mesi di vita».',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Doctor stick figure with grave expression, patient stick figure in chair, calendar in background, comic panel style'
  },
  {
    id: 'setup-9',
    text: 'Il mio biglietto del suicidio era comico…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Stick figure holding paper with laugh emoji, pen in hand, dark room with single light, comic panel style'
  },
  {
    id: 'setup-10',
    text: 'Papà, perché hai sangue sulla camicia?',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Child stick figure pointing at father with stained shirt, father looking nervous, living room setting, comic style'
  },
  {
    id: 'setup-11',
    text: 'Ha detto «sono in ritardo». Io ho risposto…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Woman stick figure looking worried, man stick figure with suspicious expression, clock in background, comic panel'
  },
  {
    id: 'setup-12',
    text: 'Il prete mi ha toccato quando avevo…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Church confessional booth silhouette, small figure and larger figure, ominous atmosphere, comic panel style'
  },
  {
    id: 'setup-13',
    text: 'Ghiacciolo del gruppo di sostegno al cancro:',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Group of stick figures in circle with hospital gowns, sad expressions, community center room, comic style'
  },
  {
    id: 'setup-14',
    text: 'Ho dato un nome al mio tumore…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Stick figure with X-ray showing mass, figure pointing at it with naming gesture, hospital background, comic panel'
  },
  {
    id: 'setup-15',
    text: 'Tuo figlio non ce l\'ha fatta in sala operatoria…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Doctor with head bowed, parents stick figures collapsing, hospital corridor, dramatic lighting, comic style'
  },
  {
    id: 'setup-16',
    text: 'Le ultime parole del nonno sono state…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Elderly stick figure in hospital bed, family gathered around, speech bubble with ellipsis, comic panel'
  },
  {
    id: 'setup-17',
    text: 'Finalmente mi sono vendicato della ex…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Stick figure with evil grin, holding revenge plan, photos of ex on wall with red strings, comic style'
  },
  {
    id: 'setup-18',
    text: 'L\'autista Uber mi ha chiesto «che fai nella vita?»',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Car interior, driver stick figure looking back, passenger with awkward expression, city lights outside, comic panel'
  },
  {
    id: 'setup-19',
    text: 'Mamma ha visto la mia cronologia…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Mother stick figure holding laptop with shocked expression, son with panicked face, living room, comic style'
  },
  {
    id: 'setup-20',
    text: 'Dobbiamo parlare della tua sorellastra…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Two stick figures in serious conversation, family photo in background, awkward atmosphere, comic panel'
  },
  // === MORE SETUP CARDS (40 additional) ===
  {
    id: 'setup-21',
    text: 'Il medico ha detto «è incurabile»…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Doctor with serious face, patient looking devastated, medical charts on wall, comic panel style'
  },
  {
    id: 'setup-22',
    text: 'Ho trovato mio marito con la babysitter…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Doorway scene, wife stick figure with shocked expression, silhouettes inside, comic panel'
  },
  {
    id: 'setup-23',
    text: 'Mamma, perché nonno non si alza più?',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Child stick figure next to elderly figure in chair, not moving, living room, comic style'
  },
  {
    id: 'setup-24',
    text: 'Il test di gravidanza è positivo…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Stick figure holding pregnancy test, bathroom background, shocked or worried expression, comic panel'
  },
  {
    id: 'setup-25',
    text: 'Il prete mi ha chiesto di restare dopo la messa…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Empty church, priest figure and small figure alone, pews in background, ominous lighting, comic style'
  },
  {
    id: 'setup-26',
    text: 'Tuo fratello è morto sul colpo…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Police officer at door, parents with devastated expressions, front porch scene, comic panel'
  },
  {
    id: 'setup-27',
    text: 'Ho investito il cane del vicino…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Car stopped, driver with panicked expression, neighbor approaching angrily, comic style'
  },
  {
    id: 'setup-28',
    text: 'Papà, c\'è sangue sotto il tappeto…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Child pointing at carpet, father with nervous expression, living room with suspicious carpet, comic panel'
  },
  {
    id: 'setup-29',
    text: 'La chemio non funziona più…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Doctor with sad expression, patient in hospital bed, IV drip beside, comic style'
  },
  {
    id: 'setup-30',
    text: 'Ho confessato tutto al terapista…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Patient on couch talking, therapist writing frantically, office setting, comic panel'
  },
  {
    id: 'setup-31',
    text: 'La ex mi ha mandato un messaggio…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Stick figure looking at phone with surprised expression, notification on screen, comic panel style'
  },
  {
    id: 'setup-32',
    text: 'Quando il dottore ha detto «gemelli»…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Ultrasound showing two babies, parents with mixed expressions, hospital room, comic style'
  },
  {
    id: 'setup-33',
    text: 'Nonna è caduta dalle scale…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Staircase with figure at bottom, family rushing, dramatic scene, comic panel'
  },
  {
    id: 'setup-34',
    text: 'Ho aperto la bara per l\'ultimo saluto…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Coffin lid being opened, figure looking inside, funeral home, comic style'
  },
  {
    id: 'setup-35',
    text: 'Il mio tumore si è chiamato…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Medical scan with mass labeled, patient looking thoughtful, comic panel'
  },
  {
    id: 'setup-36',
    text: 'Tua figlia è incinta di…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Doctor with clipboard, parents with shocked faces, hospital corridor, comic style'
  },
  {
    id: 'setup-37',
    text: 'Ho provato a salvare il gatto dal balcone…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Balcony scene, person reaching for cat, dramatic pose, comic panel'
  },
  {
    id: 'setup-38',
    text: 'Il capo mi ha convocato in ufficio…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Boss behind desk, employee standing nervously, office setting, comic style'
  },
  {
    id: 'setup-39',
    text: 'Mamma ha letto il mio diario…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Mother holding book with shocked expression, child with panicked face, bedroom, comic panel'
  },
  {
    id: 'setup-40',
    text: 'Il funerale era pieno di ex…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Funeral scene with many figures, coffin in center, awkward atmosphere, comic style'
  },
  {
    id: 'setup-41',
    text: 'Ho beccato la prof a letto con…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Doorway scene, teacher figure visible, student with shocked expression, comic panel'
  },
  {
    id: 'setup-42',
    text: 'Il giudice ha detto «ergastolo»…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Courtroom, judge with gavel, defendant collapsing, dramatic scene, comic style'
  },
  {
    id: 'setup-43',
    text: 'Papà ha perso il lavoro…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Father with box of belongings, family looking worried, office building entrance, comic panel'
  },
  {
    id: 'setup-44',
    text: 'La tac ha mostrato una massa…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Doctor pointing at scan, patient with worried expression, hospital room, comic style'
  },
  {
    id: 'setup-45',
    text: 'Ho detto «ti amo» al mio ex…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Person confessing love, ex with awkward expression, coffee shop background, comic panel'
  },
  {
    id: 'setup-46',
    text: 'Il bambino non ha superato la notte…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Doctor with bowed head, parents crying, hospital corridor, comic style'
  },
  {
    id: 'setup-47',
    text: 'Ho trovato le foto di papà con…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Person holding photos with shocked expression, desk with pictures, comic panel'
  },
  {
    id: 'setup-48',
    text: 'La moglie è tornata dall\'ospedale…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Woman entering door, husband with hopeful expression, hallway, comic style'
  },
  {
    id: 'setup-49',
    text: 'Il mio coinquilino è sparito…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Empty room with belongings, person looking confused, apartment, comic panel'
  },
  {
    id: 'setup-50',
    text: 'Ho confessato il tradimento…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Person confessing, partner with angry expression, living room scene, comic style'
  },
  {
    id: 'setup-51',
    text: 'Il nonno ha chiesto la pistola…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Elderly figure with determined expression, family looking concerned, bedroom, comic panel'
  },
  {
    id: 'setup-52',
    text: 'La biopsia è tornata positiva…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Doctor with clipboard, patient processing news, hospital room, comic style'
  },
  {
    id: 'setup-53',
    text: 'Ho visto la mamma baciare lo zio…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Child hiding and watching, two figures embracing, living room, comic panel'
  },
  {
    id: 'setup-54',
    text: 'Il mio aborto è andato storto…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Hospital bed, figure in pain, medical staff rushing, dramatic scene, comic style'
  },
  {
    id: 'setup-55',
    text: 'Papà piange guardando vecchie foto…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Father with photo album crying, child watching from doorway, bedroom, comic panel'
  },
  {
    id: 'setup-56',
    text: 'Il prete mi ha invitato a casa sua…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Priest figure at door, young person with uncertain expression, house entrance, comic style'
  },
  {
    id: 'setup-57',
    text: 'Tuo figlio è annegato nella vasca…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Police at door, parent with horrified expression, front porch, comic style'
  },
  {
    id: 'setup-58',
    text: 'Ho aperto il frigo e c\'era…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Person opening refrigerator with shocked expression, kitchen, comic panel'
  },
  {
    id: 'setup-59',
    text: 'La lettera del notaio diceva…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Person reading official letter with surprised expression, desk, comic panel'
  },
  {
    id: 'setup-60',
    text: 'Ho detto addio al mio migliore amico…',
    panel: 1,
    type: 'setup',
    category: 'dark',
    imagePrompt: 'Two figures hugging goodbye, train station or airport, emotional scene, comic style'
  }
]

// Punchline Cards (60 cards)
export const PUNCHLINE_CARDS: ComicCard[] = [
  // === PUNCHLINE CARDS ===
  {
    id: 'punch-1',
    text: '…alla fine la bara aperta è stata un errore.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Open coffin with embarrassing scene visible, funeral guests with shocked faces, comic panel style'
  },
  {
    id: 'punch-2',
    text: '…così mi sono scopato l\'oncologo.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Hospital room, doctor and patient in compromising position, comic panel style'
  },
  {
    id: 'punch-3',
    text: '…col bagnino. Nel nostro letto.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Bedroom scene with lifeguard figure, partner with angry expression, comic style'
  },
  {
    id: 'punch-4',
    text: '…ho chiesto subito il rimborso.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Person demanding money back with angry expression, store counter, comic panel'
  },
  {
    id: 'punch-5',
    text: '…stava solo pompando davanti a video di genocidi.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Figure watching TV inappropriately, dramatic irony, comic panel style'
  },
  {
    id: 'punch-6',
    text: '…solo una zampa. Fa ancora le fusa.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Person holding cat paw, paw making purring motion, surreal scene, comic style'
  },
  {
    id: 'punch-7',
    text: '…si è suicidato prima che finissi.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Therapist slumped in chair, patient still talking, comic panel style'
  },
  {
    id: 'punch-8',
    text: '…indovina chi si piglia il cazzo a Natale.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Christmas scene, figure pointing suggestively, awkward family gathering, comic style'
  },
  {
    id: 'punch-9',
    text: '…nessuno ha riso. Codardi del cazzo.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Person holding funny note, audience with straight faces, comic panel'
  },
  {
    id: 'punch-10',
    text: '…a quanto pare il ketchup non è un tratto di personalità.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Person covered in ketchup with confused expression, doctor shrugging, comic style'
  },
  {
    id: 'punch-11',
    text: '…mi tengo l\'anello e l\'assicurazione sulla vita.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Person with ring and insurance papers, smiling, graveyard in background, comic panel'
  },
  {
    id: 'punch-12',
    text: '…così ho continuato a succhiare.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Figure continuing inappropriate action, other figure shocked, comic style'
  },
  {
    id: 'punch-13',
    text: '…l\'ha chiamato Chad.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Medical scan labeled CHAD in marker, doctor with casual expression, comic panel'
  },
  {
    id: 'punch-14',
    text: '…perché «piccolo Hitler» era già preso.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'List of rejected tumor names crossed out, person shrugging, comic panel'
  },
  {
    id: 'punch-15',
    text: '…sta in un posto migliore. La mia cantina.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Person pointing to basement door, shovel visible, ominous atmosphere, comic style'
  },
  {
    id: 'punch-16',
    text: '…«almeno stavolta non era il cane».',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Grandfather in bed with shrug, family with relieved expressions, comic panel'
  },
  {
    id: 'punch-17',
    text: '…ora ho la custodia piena dei figli. E della pala.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Person with children and shovel, satisfied expression, backyard, comic style'
  },
  {
    id: 'punch-18',
    text: '…«di mestiere smaltisco cadaveri».',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Uber driver smiling, passenger with shocked expression, car interior, comic panel'
  },
  {
    id: 'punch-19',
    text: '…mi ha messo in punizione per tre anni.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Mother grounding adult child, child with embarrassed expression, comic panel'
  },
  {
    id: 'punch-20',
    text: '…adesso è lei la mia vera mamma.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Figure embracing stepsister inappropriately, family with shocked faces, comic style'
  },
  // More punchlines
  {
    id: 'punch-21',
    text: '…così ho scopato l\'infermiera per compassione.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Hospital scene, nurse and patient, comic panel style'
  },
  {
    id: 'punch-22',
    text: '…sul nostro letto, con le mutande di mia madre.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Bedroom scene with inappropriate underwear, shocked witness, comic style'
  },
  {
    id: 'punch-23',
    text: '…ha solo finito la scorta di ossigeno.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Elderly figure with empty oxygen tank, casual explanation, comic panel'
  },
  {
    id: 'punch-24',
    text: '…di tuo fratello. Ops.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Pregnant belly with awkward label, family with shocked expressions, comic style'
  },
  {
    id: 'punch-25',
    text: '…e mi ha chiesto di non dirlo a nessuno.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Priest figure making hush gesture, person with uncomfortable expression, comic panel'
  },
  {
    id: 'punch-26',
    text: '…guidava ubriaco come al solito.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Car crash scene, shrugging witness, casual attitude, comic panel'
  },
  {
    id: 'punch-27',
    text: '…ora il vicino vuole risarcimento in natura.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Neighbor with suggestive expression, guilty person, fence between, comic style'
  },
  {
    id: 'punch-28',
    text: '…è solo ketchup. Tranquilla.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Blood-like stain being explained as ketchup, nervous smile, comic panel'
  },
  {
    id: 'punch-29',
    text: '…ma almeno ho perso 15 kg.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Sickly thin person with thumbs up, doctor with concerned face, comic style'
  },
  {
    id: 'punch-30',
    text: '…e si è suicidato prima della fine sessione.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Therapist slumped, patient still on couch, comic panel'
  },
  {
    id: 'punch-31',
    text: '…con le mie foto di nudo da minorenne.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Phone showing inappropriate photos, ex with evil smile, comic style'
  },
  {
    id: 'punch-32',
    text: '…uno è mio, l\'altro del postino.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Two babies with different skin tones, mailman waving goodbye, comic panel'
  },
  {
    id: 'punch-33',
    text: '…ha dimenticato di respirare al terzo gradino.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Stairs with figure at bottom, person shrugging, comic panel'
  },
  {
    id: 'punch-34',
    text: '…e ho vomitato sul cadavere.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Open coffin with unfortunate accident, mourners disgusted, comic style'
  },
  {
    id: 'punch-35',
    text: '…Kevin. Perché è un tumore stronzo.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'X-ray with KEVIN written on it, patient with attitude, comic panel'
  },
  {
    id: 'punch-36',
    text: '…del suo prof di ginnastica.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Pregnant teen, coach in background, school setting, comic style'
  },
  {
    id: 'punch-37',
    text: '…ora ha nove vite in meno.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Cat falling with x eyes, person counting on fingers, comic panel'
  },
  {
    id: 'punch-38',
    text: '…per dirmi che sono licenziato. E pure cornuto.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Boss firing employee with extra insult, office scene, comic style'
  },
  {
    id: 'punch-39',
    text: '…ora sono in punizione eterna.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Adult in timeout corner, mother with pointing finger, comic panel'
  },
  {
    id: 'punch-40',
    text: '…tutti volevano scoparsela da morta.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Funeral with inappropriate guests, coffin in center, comic style'
  },
  {
    id: 'punch-41',
    text: '…il preside. In divisa da scolaro.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Principal in school uniform, teacher in bed, shocked student, comic style'
  },
  {
    id: 'punch-42',
    text: '…ma almeno la cella ha il wi-fi.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Prison cell with happy prisoner on phone, bars visible, comic panel'
  },
  {
    id: 'punch-43',
    text: '…perché ha scoperto che lo tradivo col suo capo.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Box of belongings, ex with boss in background, office, comic style'
  },
  {
    id: 'punch-44',
    text: '…grande come il mio ex ego.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Medical scan with huge mass, person making comparison, comic panel'
  },
  {
    id: 'punch-45',
    text: '…e lui ha risposto «anch\'io… il tuo culo».',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Awkward conversation, ex with suggestive gesture, coffee shop, comic style'
  },
  {
    id: 'punch-46',
    text: '…ora è un angioletto. Letteralmente.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Child with halo and wings, parents crying, hospital, comic style'
  },
  {
    id: 'punch-47',
    text: '…la vicina. Nuda. Dal 2008.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Old photos spread on table, naked figure visible, shocked viewer, comic style'
  },
  {
    id: 'punch-48',
    text: '…senza utero. E senza soldi.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Woman with empty pockets and surgical scar, hospital exit, comic panel'
  },
  {
    id: 'punch-49',
    text: '…l\'ho murato vivo nel seminterrato.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Fresh brick wall in basement, person with satisfied smile, comic style'
  },
  {
    id: 'punch-50',
    text: '…e lei mi ha lasciato per il terapista.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Wife leaving with therapist, husband crying on couch, comic style'
  },
  {
    id: 'punch-51',
    text: '…per spararsi. Ma ha sbagliato mira.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Elderly figure with gun, missed shot, awkward situation, comic panel'
  },
  {
    id: 'punch-52',
    text: '…ora ho un amico immaginario maligno.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Person with evil imaginary friend visible only to them, comic style'
  },
  {
    id: 'punch-53',
    text: '…mentre papà era al lavoro. Classico.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Mom and uncle embracing, photo of dad on desk, comic panel'
  },
  {
    id: 'punch-54',
    text: '…ora mi perseguita in sogno. Rompicoglioni.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Sleeping person with ghost figure complaining, dream bubble, comic style'
  },
  {
    id: 'punch-55',
    text: '…perché la mamma è scappata col vicino.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Dad crying with photos, neighbor house in background, comic panel'
  },
  {
    id: 'punch-56',
    text: '…per giocare a «padre e figlio».',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Priest with inappropriate games, nervous young person, comic style'
  },
  {
    id: 'punch-57',
    text: '…mentre io facevo la doccia.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Parent in bathroom, child in bathtub with x eyes, horror scene, comic style'
  },
  {
    id: 'punch-58',
    text: '…la testa di mia moglie.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Refrigerator opened showing severed head, person screaming, comic style'
  },
  {
    id: 'punch-59',
    text: '…che erediti tutto… tranne la sanità mentale.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Legal document with crossed out sanity, lawyer shrugging, comic panel'
  },
  {
    id: 'punch-60',
    text: '…l\'ha ucciso il cancro. Io ho solo accelerato.',
    panel: 3,
    type: 'punchline',
    category: 'dark',
    imagePrompt: 'Grave with two causes of death, person shrugging, cemetery, comic style'
  }
]

// Absurd Cards (30 cards)
export const ABSURD_CARDS: ComicCard[] = [
  {
    id: 'absurd-1',
    text: 'Un dildo senziente va in terapia',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Cartoon dildo sitting on therapy couch, therapist with notepad, office setting, absurd comic style'
  },
  {
    id: 'absurd-2',
    text: 'Prete, chierichetto e capra entrano in un bar…',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Priest, altar boy and goat walking into bar, bartender with confused expression, absurd scene'
  },
  {
    id: 'absurd-3',
    text: 'Le ceneri della nonna sanno di rimpianto',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Person tasting ashes from urn with thoughtful expression, surreal scene, comic style'
  },
  {
    id: 'absurd-4',
    text: 'Dildo parlante a cena di famiglia',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Family dinner table with talking dildo in chair, everyone acting normal, absurd comic'
  },
  {
    id: 'absurd-5',
    text: 'Il fantasma di Hitler su Grindr',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Ghost Hitler with smartphone showing dating app, confused reactions, absurd scene'
  },
  {
    id: 'absurd-6',
    text: 'Mano mozzata fa ok in sala operatoria',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Severed hand giving thumbs up in operating room, surgeons reacting, absurd comic'
  },
  {
    id: 'absurd-7',
    text: 'Il mio aborto mi ha mandato un biglietto di ringraziamento',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Person holding thank you card from fetus, surreal mail scene, absurd comic'
  },
  {
    id: 'absurd-8',
    text: 'Clown con disfunzione erettile alla festa di compleanno',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Sad clown at kids party, parents with concerned expressions, absurd scene'
  },
  {
    id: 'absurd-9',
    text: 'La tavola ouija dice «tua madre ti saluta»',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Ouija board spelling out mother message, people around table, supernatural comedy'
  },
  {
    id: 'absurd-10',
    text: 'Gruppo di supporto vegani cannibali',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Support group circle, people eating salad and human parts, absurd comic scene'
  },
  {
    id: 'absurd-11',
    text: 'Fantasma di Hitler su Tinder',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Ghost Hitler swiping on dating app, profile visible, absurd comedy scene'
  },
  {
    id: 'absurd-12',
    text: 'Dildo posseduto che parla in latino',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Possessed object speaking ancient language, exorcist scene gone wrong, absurd comic'
  },
  {
    id: 'absurd-13',
    text: 'Nonna resuscitata che chiede il culo',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Zombie grandmother making inappropriate request, family shocked, absurd scene'
  },
  {
    id: 'absurd-14',
    text: 'Aborto che torna per vendetta',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Ghost fetus seeking revenge, person with terrified expression, absurd horror comedy'
  },
  {
    id: 'absurd-15',
    text: 'Mano mozzata che fa le pernacchie',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Severed hand making fart noises, people annoyed, absurd slapstick scene'
  },
  {
    id: 'absurd-16',
    text: 'Prete con OnlyFans di flagellazioni',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Priest recording content for adult site, church background, absurd satire'
  },
  {
    id: 'absurd-17',
    text: 'Tumore che apre un profilo Instagram',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Medical scan taking selfie, patient with phone, influencer cancer, absurd comedy'
  },
  {
    id: 'absurd-18',
    text: 'Clown suicida a una festa di compleanno',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Depressed clown at kids party, noose nearby, dark absurd scene'
  },
  {
    id: 'absurd-19',
    text: 'Tavola ouija che dice «tua madre è bona»',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Ouija board with inappropriate message, participants shocked, absurd comedy'
  },
  {
    id: 'absurd-20',
    text: 'Vegano che mangia il proprio cane per sbaglio',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Person realizing what they are eating, dog collar visible, absurd dark comedy'
  },
  {
    id: 'absurd-21',
    text: 'Bambino posseduto che chiede la PlayStation',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Demon child with glowing eyes demanding gaming console, parents negotiating, absurd scene'
  },
  {
    id: 'absurd-22',
    text: 'Scheletro che fa ghosting su WhatsApp',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Skeleton ignoring messages on phone, ghost emoji visible, pun comedy'
  },
  {
    id: 'absurd-23',
    text: 'Padreterno su Grindr che cerca twink',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'God figure on dating app with specific preferences, absurd religious satire'
  },
  {
    id: 'absurd-24',
    text: 'Ceneri della zia sparse nel caffè',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Person pouring ashes into coffee, others watching, absurd dark comedy'
  },
  {
    id: 'absurd-25',
    text: 'Necrofilo che si lamenta del rigor mortis',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Person complaining about stiff corpse, mortuary setting, absurd dark comedy'
  },
  {
    id: 'absurd-26',
    text: 'Capra che testimonia al processo del prete',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Goat on witness stand, court room scene, priest defendant, absurd legal comedy'
  },
  {
    id: 'absurd-27',
    text: 'Mio gemello malvagio che è il mio ex',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Person looking at evil twin who is also their ex, confused expression, absurd scene'
  },
  {
    id: 'absurd-28',
    text: 'Corvo che porta la parcella del veterinario',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Crow delivering bill to pet owner, dead pet visible, absurd dark comedy'
  },
  {
    id: 'absurd-29',
    text: 'Fantasma della ex che mi critica mentre scopo',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Ghost of ex with judgmental expression in bedroom, awkward situation, absurd comedy'
  },
  {
    id: 'absurd-30',
    text: 'Zombie che fa la dieta keto',
    panel: 1,
    type: 'setup',
    category: 'absurd',
    imagePrompt: 'Zombie eating brains while counting carbs, fitness tracker visible, absurd scene'
  }
]

// All cards combined
export const ALL_CARDS: ComicCard[] = [
  ...SETUP_CARDS,
  ...PUNCHLINE_CARDS,
  ...ABSURD_CARDS
]

// Helper function to get cards by type
export function getSetupCards(): ComicCard[] {
  return SETUP_CARDS
}

export function getPunchlineCards(): ComicCard[] {
  return PUNCHLINE_CARDS
}

export function getAbsurdCards(): ComicCard[] {
  return ABSURD_CARDS
}

// Get cards filtered by content filter
export function getFilteredCards(filter: 'soft' | 'free', darkMode: boolean): {
  setups: ComicCard[]
  punchlines: ComicCard[]
} {
  let availableSetupCards = [...SETUP_CARDS, ...ABSURD_CARDS.filter(c => c.type === 'setup')]
  let availablePunchlineCards = [...PUNCHLINE_CARDS]

  if (filter === 'soft') {
    availableSetupCards = availableSetupCards.filter(c => c.category !== 'dark' && c.category !== 'crude')
    availablePunchlineCards = availablePunchlineCards.filter(c => c.category !== 'dark' && c.category !== 'crude')
  }

  if (!darkMode) {
    availableSetupCards = availableSetupCards.filter(c => c.category !== 'crude')
    availablePunchlineCards = availablePunchlineCards.filter(c => c.category !== 'crude')
  }

  return {
    setups: availableSetupCards,
    punchlines: availablePunchlineCards
  }
}
