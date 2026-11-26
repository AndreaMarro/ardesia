"""Distinct independent reviewer; no authoring import or human approval."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from .electric_exact_literals import exact_literal,numeric_lexeme
from . import reflection_image_height_review_models as model
SI=pint.UnitRegistry(non_int_type=Fraction)
def unique(values,want):
    if [i for i,v in enumerate(values)if sp.simplify(v-want)==0]!=[0]:raise ValueError('Independent symbolic alternatives not unique')
def decode_numeric(raw):
    return exact_literal(raw)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-03.json'
FAMILY='projected-image-height'
EXPECTED_IDS={'AR-u7-projected-image-height-05', 'AR-u7-projected-image-height-09', 'AR-u7-projected-image-height-11', 'AR-u7-projected-image-height-15', 'AR-u7-projected-image-height-03', 'AR-u7-projected-image-height-10', 'AR-u7-projected-image-height-16', 'AR-u7-projected-image-height-04', 'AR-u7-projected-image-height-12', 'AR-u7-projected-image-height-14', 'AR-u7-projected-image-height-02', 'AR-u7-projected-image-height-01', 'AR-u7-projected-image-height-06', 'AR-u7-projected-image-height-13', 'AR-u7-projected-image-height-07', 'AR-u7-projected-image-height-08'}
REVIEWED_SKILLS={1: 'C5-L10', 2: 'C5-L10', 3: 'C5-L10', 4: 'C5-L10', 5: 'C5-L10', 6: 'C5-L10', 7: 'C5-L10', 8: 'C5-L10', 9: 'C5-L10', 10: 'C5-L10', 11: 'C5-L10', 12: 'C5-L10', 13: 'C5-L10', 14: 'C5-L10', 15: 'C5-L10', 16: 'C5-L10'}

@lru_cache(maxsize=1)
def oracle():
    h,p,f,H,k1,k2=sp.symbols('h p f H k1 k2',positive=True)
    unique([h*f/(p-f),h*p/f,h*f/p,h*(p-f)/f,-h*f/(p-f)],h*f/(p-f))
    unique([H*(p-f)/f,H*f/(p-f),H*(p+f)/f,(p-f)/(H*f),-H*(p-f)/f],H*(p-f)/f)
    unique([k1*(p-f)/(k2*p-f),k1/k2,k1*k2,k1*(k2*p-f)/(p-f),k1+k2],k1*(p-f)/(k2*p-f))
    d=model.primary_only_derivations()[262]
    out=[d[n]for n in range(1,17)]
    out[1]='mm'
    out[2]='H = h_o f / (p − f)'
    out[3]='Da 1 a 2 mm'
    out[8]='h_o = H (p − f) / f'
    out[9]='κ₁ (p − f) / (κ₂ p − f)'
    return out

MANUAL=['Da1/f=1/p+1/q,con f2cm,p4cm si trova q4cm. M=q/p=1; h_i=−1mm e H1mm. Ho ricalcolato l’edizione in mm separatamente dalla primaria originale in cm: il coefficiente del rapporto numerico resta identico,la grandezza fisica è dieci volte minore.', 'H è una lunghezza in mm,M=H/h_o puro. Le unità del rapporto ottico si cancellano; la prima deriva dalla dimensione dell’altezza. Tutte le cinque opzioni sono state lette dopo la primaria.', 'H=h_o q/p e q=fp/(p−f)→H=h_o f/(p−f). Il rapporto di due lunghezze in cm moltiplica h_o in mm e restituisce mm. Significa modulo; h_i conserva invece il segno meno.', 'A:h_o1mm,p4cm→H1mm. B:h_o2mm,p4cm→H2mm. Lo stesso ingrandimento1 raddoppia l’altezza ma non cambia l’orientamento capovolto.', 'h_o=H(p−f)/f=(1mm)(2cm)/(2cm)=1mm. Controllo avanti H1mm; non si sommano mm con cm.', 'p=f(1+h_o/H)=(2cm)(1+1mm/1mm)=4cm. Il rapporto delle altezze è puro e p supera f; il ramo al fuoco è escluso.', 'A:H1mm. B:(1mm)(2cm)/(4cm)=1/2mm, rapporto1/2. La dipendenza è da p−f,non da1/p da solo.', 'Il proposto2mm meno H1mm dà+1mm. Non sottrarre h_i=−1mm: il quesito confronta moduli.', 'h_o=H(p−f)/f,con p>f e H>0. Il rapporto (p−f)/f è positivo e puro; l’inversa si verifica nella legge generale,non solo al caso p=2f in cui entrambe le frazioni valgono1.', 'H_B/H_A=κ₁(p−f)/(κ₂p−f),con f2cm invariata eκ₂p>f. Il termine f non scala con p:κ₂p−f non èκ₂(p−f).', 'A:H1mm. B:h_o2mm,p3cm→H(2mm)(2cm)/(1cm)=4mm. Rapporto4,combinazione dei due fattori2.', 'Media(1+4)/2=5/2mm. Gli ingressi medi h_o3/2mm,p7/2cm danno H2mm; differenza1/2mm. Le due immagini appartengono ai rispettivi piani reali.', 'Target H_B4mm con h_o2mm: p_B=(2cm)(1+2mm/4mm)=3cm. Rapporto rispetto p_A4cm:3/4.', 'Riferimento H1mm,D3→g3mm⁻¹. Nuovo D12→H4mm; p3cm implica h_o=4mm·(1cm)/(2cm)=2mm.', 'Riferimenti H_A=1 mm e H_B=4 mm, D_A=3 e D_B=9: g=2 mm⁻¹, b=1. C:D=5→H=2 mm; p=4 cm→h_o=2 mm.', 'Nuovo vincolo fisico h_o=p/40,non p/4 come nella fonte. Con P=p/(1cm)>2 si ha h_o=(P/4)mm. Quindi H/(1mm)=P/[2(P−2)]=1→2P−4=P→P4. p4cm,h_o1mm. È lo stesso numero finale per un problema fisico dichiaratamente riparametrizzato; otto cm dà2/3mm,non1mm.']

DISTRACTORS=['H1mm,h_i−1mm.2mm doppio,1/2mm usa f/p,negativo orientato non modulo,1cm conversione errata.', 'mm lunghezza,1 rapporto,mm⁻¹ inverso lunghezza,gradi angolo,s tempo.', 'h_of/(p−f).h_op/f nonq/p,h_of/p ignora−f,rapporto invertito altra legge,negativo h_i nonH.', '1→2mm.1/2 inverse,4 quadrato,1 ignora,2cm dieci volte uscita corretta.', 'h_o1mm.2→H2mm,1/2→H1/2mm,1cm→H10mm.', 'p4cm.2cm fuoco,1cm virtuale,3cm dàH2mm.', '(1/2mm)/(1mm)=1/2.2 reciproco,1/3 richiederebbe p8cm,3/2 rapporto p,1 ignora.', '2−1=1mm.−1 ordine,2 proposta,1/2 rapporto inverso,0 non controlla.', 'H(p−f)/f. Stessa frazione avanti non inversa generale,p+f altra legge,(p−f)/(Hf) L⁻¹,negativo viola h_o>0.', 'κ₁(p−f)/(κ₂p−f),nuovo denominatore positivo.κ₁/κ₂ omette f,prodotto distanza diretta,rapporto denominatori inverso,somma2 per identiche.', '4=4mm/1mm.1/4 reciproco,2 solo un effetto,3/4 distanze p,1 ignora.', '5/2mm.2 dati medi,5 somma,3/2 semidifferenza,4 B.', 'p_B3cm→rapporto3/4.4/3 reciproco,4 target uscite,2 altezza,1 darebbe H2mm.', 'h_o2mm.6mm usa D12 comeH e produceD36,4mm copiaH,1mm produceD6.', 'h_o2mm.5/2mm omette b e produceD6,4mm omette g e produceD9,1mm ripete A.', 'P4cm con nuovo vincolo fisico p/40.2cm polo escluso,8cm→H2/3mm; non importare coefficiente p/4 della fonte senza le nuove unità dichiarate.']

ASSUMPTIONS=['Lente sottile convergente parassiale, f2cm fissa e stesso mezzo ai due lati; oggetto reale h_o>0,p>2cm e immagine reale orientata h_i<0. H=|h_i| positivo. Nell’edizione letta altezze in mm, distanze assiali in cm, rapporto f/(p−f) coerente e puro. Il cambio delle altezze rispetto alla fonte è dichiarato, non una conversione silenziosa; formula omogenea ricalcolata con Pint. Nel16 coefficiente fisico h_o=p/40 con lunghezze nella stessa unità.', 'Lente sottile convergente parassiale, f2cm fissa e stesso mezzo ai due lati; oggetto reale h_o>0,p>2cm e immagine reale orientata h_i<0. H=|h_i| positivo. Nell’edizione letta altezze in mm, distanze assiali in cm, rapporto f/(p−f) coerente e puro. Il cambio delle altezze rispetto alla fonte è dichiarato, non una conversione silenziosa; formula omogenea ricalcolata con Pint. Nel16 coefficiente fisico h_o=p/40 con lunghezze nella stessa unità.', 'Lente sottile convergente parassiale, f2cm fissa e stesso mezzo ai due lati; oggetto reale h_o>0,p>2cm e immagine reale orientata h_i<0. H=|h_i| positivo. Nell’edizione letta altezze in mm, distanze assiali in cm, rapporto f/(p−f) coerente e puro. Il cambio delle altezze rispetto alla fonte è dichiarato, non una conversione silenziosa; formula omogenea ricalcolata con Pint. Nel16 coefficiente fisico h_o=p/40 con lunghezze nella stessa unità.', 'Lente sottile convergente parassiale, f2cm fissa e stesso mezzo ai due lati; oggetto reale h_o>0,p>2cm e immagine reale orientata h_i<0. H=|h_i| positivo. Nell’edizione letta altezze in mm, distanze assiali in cm, rapporto f/(p−f) coerente e puro. Il cambio delle altezze rispetto alla fonte è dichiarato, non una conversione silenziosa; formula omogenea ricalcolata con Pint. Nel16 coefficiente fisico h_o=p/40 con lunghezze nella stessa unità.', 'Lente sottile convergente parassiale, f2cm fissa e stesso mezzo ai due lati; oggetto reale h_o>0,p>2cm e immagine reale orientata h_i<0. H=|h_i| positivo. Nell’edizione letta altezze in mm, distanze assiali in cm, rapporto f/(p−f) coerente e puro. Il cambio delle altezze rispetto alla fonte è dichiarato, non una conversione silenziosa; formula omogenea ricalcolata con Pint. Nel16 coefficiente fisico h_o=p/40 con lunghezze nella stessa unità.', 'Lente sottile convergente parassiale, f2cm fissa e stesso mezzo ai due lati; oggetto reale h_o>0,p>2cm e immagine reale orientata h_i<0. H=|h_i| positivo. Nell’edizione letta altezze in mm, distanze assiali in cm, rapporto f/(p−f) coerente e puro. Il cambio delle altezze rispetto alla fonte è dichiarato, non una conversione silenziosa; formula omogenea ricalcolata con Pint. Nel16 coefficiente fisico h_o=p/40 con lunghezze nella stessa unità.', 'Lente sottile convergente parassiale, f2cm fissa e stesso mezzo ai due lati; oggetto reale h_o>0,p>2cm e immagine reale orientata h_i<0. H=|h_i| positivo. Nell’edizione letta altezze in mm, distanze assiali in cm, rapporto f/(p−f) coerente e puro. Il cambio delle altezze rispetto alla fonte è dichiarato, non una conversione silenziosa; formula omogenea ricalcolata con Pint. Nel16 coefficiente fisico h_o=p/40 con lunghezze nella stessa unità.', 'Lente sottile convergente parassiale, f2cm fissa e stesso mezzo ai due lati; oggetto reale h_o>0,p>2cm e immagine reale orientata h_i<0. H=|h_i| positivo. Nell’edizione letta altezze in mm, distanze assiali in cm, rapporto f/(p−f) coerente e puro. Il cambio delle altezze rispetto alla fonte è dichiarato, non una conversione silenziosa; formula omogenea ricalcolata con Pint. Nel16 coefficiente fisico h_o=p/40 con lunghezze nella stessa unità.', 'Lente sottile convergente parassiale, f2cm fissa e stesso mezzo ai due lati; oggetto reale h_o>0,p>2cm e immagine reale orientata h_i<0. H=|h_i| positivo. Nell’edizione letta altezze in mm, distanze assiali in cm, rapporto f/(p−f) coerente e puro. Il cambio delle altezze rispetto alla fonte è dichiarato, non una conversione silenziosa; formula omogenea ricalcolata con Pint. Nel16 coefficiente fisico h_o=p/40 con lunghezze nella stessa unità.', 'Lente sottile convergente parassiale, f2cm fissa e stesso mezzo ai due lati; oggetto reale h_o>0,p>2cm e immagine reale orientata h_i<0. H=|h_i| positivo. Nell’edizione letta altezze in mm, distanze assiali in cm, rapporto f/(p−f) coerente e puro. Il cambio delle altezze rispetto alla fonte è dichiarato, non una conversione silenziosa; formula omogenea ricalcolata con Pint. Nel16 coefficiente fisico h_o=p/40 con lunghezze nella stessa unità.', 'Lente sottile convergente parassiale, f2cm fissa e stesso mezzo ai due lati; oggetto reale h_o>0,p>2cm e immagine reale orientata h_i<0. H=|h_i| positivo. Nell’edizione letta altezze in mm, distanze assiali in cm, rapporto f/(p−f) coerente e puro. Il cambio delle altezze rispetto alla fonte è dichiarato, non una conversione silenziosa; formula omogenea ricalcolata con Pint. Nel16 coefficiente fisico h_o=p/40 con lunghezze nella stessa unità.', 'Lente sottile convergente parassiale, f2cm fissa e stesso mezzo ai due lati; oggetto reale h_o>0,p>2cm e immagine reale orientata h_i<0. H=|h_i| positivo. Nell’edizione letta altezze in mm, distanze assiali in cm, rapporto f/(p−f) coerente e puro. Il cambio delle altezze rispetto alla fonte è dichiarato, non una conversione silenziosa; formula omogenea ricalcolata con Pint. Nel16 coefficiente fisico h_o=p/40 con lunghezze nella stessa unità.', 'Lente sottile convergente parassiale, f2cm fissa e stesso mezzo ai due lati; oggetto reale h_o>0,p>2cm e immagine reale orientata h_i<0. H=|h_i| positivo. Nell’edizione letta altezze in mm, distanze assiali in cm, rapporto f/(p−f) coerente e puro. Il cambio delle altezze rispetto alla fonte è dichiarato, non una conversione silenziosa; formula omogenea ricalcolata con Pint. Nel16 coefficiente fisico h_o=p/40 con lunghezze nella stessa unità.', 'Lente sottile convergente parassiale, f2cm fissa e stesso mezzo ai due lati; oggetto reale h_o>0,p>2cm e immagine reale orientata h_i<0. H=|h_i| positivo. Nell’edizione letta altezze in mm, distanze assiali in cm, rapporto f/(p−f) coerente e puro. Il cambio delle altezze rispetto alla fonte è dichiarato, non una conversione silenziosa; formula omogenea ricalcolata con Pint. Nel16 coefficiente fisico h_o=p/40 con lunghezze nella stessa unità.', 'Lente sottile convergente parassiale, f2cm fissa e stesso mezzo ai due lati; oggetto reale h_o>0,p>2cm e immagine reale orientata h_i<0. H=|h_i| positivo. Nell’edizione letta altezze in mm, distanze assiali in cm, rapporto f/(p−f) coerente e puro. Il cambio delle altezze rispetto alla fonte è dichiarato, non una conversione silenziosa; formula omogenea ricalcolata con Pint. Nel16 coefficiente fisico h_o=p/40 con lunghezze nella stessa unità.', 'Lente sottile convergente parassiale, f2cm fissa e stesso mezzo ai due lati; oggetto reale h_o>0,p>2cm e immagine reale orientata h_i<0. H=|h_i| positivo. Nell’edizione letta altezze in mm, distanze assiali in cm, rapporto f/(p−f) coerente e puro. Il cambio delle altezze rispetto alla fonte è dichiarato, non una conversione silenziosa; formula omogenea ricalcolata con Pint. Nel16 coefficiente fisico h_o=p/40 con lunghezze nella stessa unità.']

UNITS={1: 'millimeter', 2: 'millimeter', 3: 'millimeter', 4: 'millimeter', 5: 'millimeter', 6: 'centimeter', 7: '', 8: 'millimeter', 9: 'millimeter', 10: '', 11: '', 12: 'millimeter', 13: '', 14: 'millimeter', 15: 'millimeter', 16: 'centimeter'}

NUMERIC_UNITS={1: 'mm', 5: 'mm', 6: 'cm', 14: 'mm', 15: 'mm', 16: 'cm'}

SUFFIX={}

NON_NUMERIC_DISTRACTORS={}

SVG_REVIEW='XML letto integralmente e nuovo native completo640×1740 effettivamente letto dopo child0. Lente x320,oggetto160,immagine480,fuochi240/400:scala assiale40 coordinate/cm dà p=q4cm,f2cm. Altezze40/−40 con scala40 coordinate/mm e fattore relativo10 dichiarato rispetto alla scala assiale40 coordinate/cm. Raggi centrale e parallelo incrociano(480,360);m=−1,M=1,H=1mm. Barre80/320/200 perH_A=1mm,H_B=4mm e media5/2mm,scala80 comune. Curva solo h_o1mm: x150+60p[cm],y1510−120H[mm],p>2; punto(390,1390)=(4cm,1mm),asintoto verticale270 escluso. Polilinea campionata con y arrotondate5decimali,non domanda da calcolatrice.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

CANDIDATE_REF='e4a15286e6151c4fa2118a503c348549b25b4681'

PRIMARY_SHA256='d5f076f221127f55926b8db14609e5903199f8f03b8d2bfb2e752b8df003583d'

REVIEWED_MODEL_SHA256='4094cbd8c203f98ee7efa3e0ba4599f741ce7aa7cd351133a9d2125b81a2624e'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='70afbbd18001fc41e26300923f7bf5315a1334a5966ec6dfbacbfb0ce9091797'

REVIEWED_BINDINGS_SHA256='19908a0f4a643bb4951e43d7bcd1f4ea0cddc8d1d4c4cdbc08a5bf4e6ff210ae'

REVIEWED_CANDIDATES={'AR-u7-projected-image-height-01': 'f3cbf7f7442ddcf591f0761cb3848e30768f3503f9d5b7f37c5b1e3f942aa0b5', 'AR-u7-projected-image-height-02': '6fd6bf39301d4ea9a55561e6ef302066b32a5be1aa44890fb04c3fd8112557c0', 'AR-u7-projected-image-height-03': '4955f1d0ed054079d97baf3045a5b7dbce6fda3f6230fa3ac6b88d28eb6a93b4', 'AR-u7-projected-image-height-04': 'bc56cfa364113f9f9876e2e4fd5d22ccfa455179938a7b1b159ff9b79d43fe64', 'AR-u7-projected-image-height-05': 'f571160d0795b6c7141939c040cf4e12977e8c80cfdfbc70917b2f95d92bcf16', 'AR-u7-projected-image-height-06': '990e281bf8b3207a07878fbe69b69485afdc6462f83d7976a1f7d6c57bd9de5c', 'AR-u7-projected-image-height-07': 'd13af5e12f5cd536016510e7680e2eabbff724c5a97ed04cdaff45b5cd0f1907', 'AR-u7-projected-image-height-08': '0ea7593fe43586ee6b0f299a657185d8d84c74d49f49aee6c96e860f9db862ab', 'AR-u7-projected-image-height-09': 'fcc35e6b1e980813b559e982c42ba1d402190de54c1ff8795d9ebc6c30096c35', 'AR-u7-projected-image-height-10': 'd2494ebc10dcfc819c81679552e384296cc4b761954e6127496d5548f36be98c', 'AR-u7-projected-image-height-11': '26ad6de2df5d5c49c683530c7f08dc5d78430fdaa8442b0de22d9f7f46a586f5', 'AR-u7-projected-image-height-12': '1e2f733c16f8ff36748eae573b29a3f01e87472900ebc7753df18c133ccd6646', 'AR-u7-projected-image-height-13': '941cb94dc8c10b4476f761d402e2586058c8c516df7f84c8d0397f0f40b35279', 'AR-u7-projected-image-height-14': 'd25ac30b2565dc3e9504a39a6600efe1bb92d231af478a43300b081424a18d62', 'AR-u7-projected-image-height-15': '26c112b5389ed3fc05f7b750b145d91b5d25179e79532c33f46098d59ef89075', 'AR-u7-projected-image-height-16': 'fb25e8ededa61ee2a527a39ef014423b44f642f984ab31640b86191b471ff6df'}

READ_SOURCE_SHA256={'u7-projected-image-height-01': '11a7073578557e4c5c31564d5f60a7fcc18e88cdb52434cad7bd0b75c82ea496', 'u7-projected-image-height-02': '06d835a444838889ac62bb5609b1825b9d9f7bc3cd90c6fcba9a08b5e7652542', 'u7-projected-image-height-03': 'bffe44fd4abd863db3621c919be7b2d5f181b9ec6bce199809dd75f95e7b5a28', 'u7-projected-image-height-04': '967bd04837ab0161c6cf4e0f3b3f84346194ebc66e80e809ee53055bc86de370', 'u7-projected-image-height-05': 'f917ecaf5c53b5f0f2e573c5629dc942e2f54fa2bd0fb5ef189de6444c8ed38c', 'u7-projected-image-height-06': '4521bf556405a05d16e289b9cb66fd8881e94586d71ca2a0d413d0c2001a1ffb', 'u7-projected-image-height-07': '4d9513a3aa583c3a04cba43dc97cde69ecf4c62a3c1a9d370e16c1b78ba9ef08', 'u7-projected-image-height-08': '5b6e5e4b2d36b89b590480349a14a3044a1aa1d5469320c027de68a75d90c618', 'u7-projected-image-height-09': 'ed6d16c3b883b6268dccf45abffc2c6fc7eb589ef9c0f2c5e58bdbe981c48cdb', 'u7-projected-image-height-10': '3dd7445ce40b1acb32957ed805727ef1b15d4325572b8c41b6967427f7731fad', 'u7-projected-image-height-11': '6d1525e4d8e3988ea26569cfbef2f0e1ad7e7a37657d60f147ba14c15c344827', 'u7-projected-image-height-12': 'b8fa8e9282288eea72417f51b11242504f1566ab3a2e05a04458cc8e684868dc', 'u7-projected-image-height-13': 'c5a222ab68dbe03daaef534c7f29e395197d72fa7445db88ae24db11803cbc30', 'u7-projected-image-height-14': 'd09f1e5fab5d4c7b8d979a259b0ea44b85eb8367e1885357518a1afd4f46756b', 'u7-projected-image-height-15': '3d0065eaca1f4a0434ba4321d9aacf1efd0d0b8db8acf7c719a4b55f16ec67a0', 'u7-projected-image-height-16': 'f565c9ed89b5a0573c4f4622477f910b1652962cb3bbcaa43dc692fc68575d71'}

SOURCE_READING='Tutti32 originali derivati nella primaria prompt-onlyd5f076f2 congelata46b0e987 prima di candidati. Modelli scritti prima dell’esposizione incidentale di una label beta60 via ps argv,ma eseguiti/congelati bbda8bd4 dopo:disclosure completa nella ricevuta,nessuna falsa dichiarazione NONE. Il60° era già nella primaria. Poi tutti32 campi,opzioni,blocchi,hint,feedback e due XML/native completi letti;262 riparametrizzazione fisica in mm e vincolo p/40 ricalcolati separatamente senza mutare la fonte. Nessun modulo autore o primariaB aperti. ROOT integrazione PENDING,UI prodotto e human NOT_RUN.'

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if sha(Path(codec.__file__).read_bytes())!=REVIEWED_LITERAL_CODEC_SHA256:common.append('Independent exact literal codec dependency changed')
    if sha(Path(model.__file__).read_bytes())!=REVIEWED_MODEL_SHA256:common.append('Independent physical model dependency changed')
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u7-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C5' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=numeric_lexeme(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
                if suffix==' giri' and raw.endswith(' giro'):raw=raw.removesuffix(' giro')+' giri'
                if suffix and not raw.endswith(suffix):raise ValueError('missing physical unit')
                if suffix:raw=raw.removesuffix(suffix).strip()
                if len(raw)>60:raise ValueError('literal too long')
                exact=decode_numeric(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
                if row['answer']['type']=='choice':
                    equivalent=[]
                    for alternative in row['answer']['options']:
                        option=str(alternative).replace('−','-').strip()
                        if option in NON_NUMERIC_DISTRACTORS.get(n,set()):continue
                        if suffix and not option.endswith(suffix):raise ValueError('alternative missing physical unit')
                        if suffix:option=option.removesuffix(suffix).strip()
                        if sp.simplify(decode_numeric(option)-want)==0:equivalent.append(alternative)
                    if equivalent!=[value]:errors.append('Independent '+FAMILY+' numeric alternatives not unique')
            except (ValueError,TypeError,ZeroDivisionError,SyntaxError,RecursionError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and (row['answer'].get('unit')!=NUMERIC_UNITS.get(n) or row['answer'].get('tolerance')!=0):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,
          'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
          'pedagogicalReview':'Consegna, tutti i passaggi, alternative, hint e feedback letti separatamente; procedura manuale esatta e condizioni controllate. '+MANUAL[n-1],
          'scientificAssetReview':SVG_REVIEW if assets else 'Nessuna figura collegata a questo record; testi e formule letti integralmente.',
          'calculationScope':CALCULATION_SCOPE.get(n,'EXACT_MANUAL_CALCULATION'),
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'reviewDependencySha256':{Path(codec.__file__).name:sha(Path(codec.__file__).read_bytes()),Path(model.__file__).name:sha(Path(model.__file__).read_bytes())},
          'methods':['SymPy_independent_reflection_matrix_conjugates_and_height_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}
