import { Question, Subject } from '../types';
import subjectsData from './subjects.json';

export const questionsList: Question[] = [
  {
    "id": 1,
    "text": "Asar epigrafi nimadan olingan?",
    "options": [
      "Alyordan",
      "Shoh Muslim",
      "Suqrot",
      "Mingbuloq"
    ],
    "correctAnswer": 0
  },
  {
    "id": 2,
    "text": "Qaysi podshoh haqida hikoya berilgan muqaddimada?",
    "options": [
      "Shoh Muslim",
      "Firavn",
      "Tursunali",
      "G'afurjon"
    ],
    "correctAnswer": 0
  },
  {
    "id": 3,
    "text": "Bolaning kelajagini kim bashorat qiladi?",
    "options": [
      "Suqrot",
      "Abdullajon",
      "Tursunali",
      "Yusufjon"
    ],
    "correctAnswer": 0
  },
  {
    "id": 4,
    "text": "Otasining saqolini yarmini yulib olganda bola qanchalik edi?",
    "options": [
      "40 kunlik",
      "2 oylik",
      "1 yoshli",
      "2 yoshli"
    ],
    "correctAnswer": 0
  },
  {
    "id": 5,
    "text": "Voqealar qaysi qishloqda boshlandi?",
    "options": [
      "Mingbuloq",
      "Toshkent",
      "Parkent",
      "Chimyon"
    ],
    "correctAnswer": 0
  },
  {
    "id": 6,
    "text": "Mingbuloqda g'oliblik nashidasini surgan shaxs?",
    "options": [
      "Abdullajon",
      "Tursunali",
      "G'afurjon",
      "Qosimjon"
    ],
    "correctAnswer": 0
  },
  {
    "id": 7,
    "text": "Tursunali akaning Universitet bn shartnomasi qancha muddatga edi?",
    "options": [
      "4 yil",
      "5 yil",
      "3 yil",
      "6 yil"
    ],
    "correctAnswer": 0
  },
  {
    "id": 8,
    "text": "G'afurjon akaning qon bosimi nechchidan tushmayotgandi?",
    "options": [
      "200 dan",
      "180 dan",
      "150 dan",
      "220 dan"
    ],
    "correctAnswer": 0
  },
  {
    "id": 9,
    "text": "Sayyoraning uyi qaysi ko'chada edi?",
    "options": [
      "Xorazm ko'chada",
      "Toshkent ko'chada",
      "Mingbuloq ko'chada",
      "Parkent ko'chada"
    ],
    "correctAnswer": 0
  },
  {
    "id": 10,
    "text": "Asarda oltin medal olgan qahramonlar kimlar edi?",
    "options": [
      "Abdulla, Po'lat",
      "Qosimjon, Alisher",
      "Abdulla, Yusufjon",
      "Po'lat, Husanxon"
    ],
    "correctAnswer": 0
  },
  {
    "id": 11,
    "text": "Po'lat bn kim tanishtiradi Abdullani?",
    "options": [
      "Sap-sariq, oriq yigit",
      "G'afurjon aka",
      "Husanxon",
      "Qosimjon"
    ],
    "correctAnswer": 0
  },
  {
    "id": 12,
    "text": "Professor Tursunali asli qayerlik?",
    "options": [
      "O'ratepa",
      "Toshkent",
      "Qo'qon",
      "Parkent"
    ],
    "correctAnswer": 0
  },
  {
    "id": 13,
    "text": "G'afurjon aka qaysi bozorda ishlagan?",
    "options": [
      "Mirobod bozorida",
      "Chorsu bozorida",
      "Oloy bozorida",
      "Eski shahar bozorida"
    ],
    "correctAnswer": 0
  },
  {
    "id": 14,
    "text": "Abdullaning sinfdoshlari qayerda dam olishdi?",
    "options": [
      "Chimyon",
      "Mingbuloq",
      "Toshkent",
      "Parkent"
    ],
    "correctAnswer": 0
  },
  {
    "id": 15,
    "text": "Asarda Zumrad obrazi kim edi?",
    "options": [
      "Qosimjonning oyisi",
      "Abdullaning opasi",
      "Gulchehra",
      "Saodat opa"
    ],
    "correctAnswer": 0
  },
  {
    "id": 16,
    "text": "Qosimjonlar oilada nechta farzand edi?",
    "options": [
      "6 ta",
      "4 ta",
      "5 ta",
      "7 ta"
    ],
    "correctAnswer": 0
  },
  {
    "id": 17,
    "text": "Cheksiz shodlik, shirin xayollar orzu umidlar bulog'i ta'rif nima haqida?",
    "options": [
      "Tun",
      "Tong",
      "Bahor",
      "Qishloq"
    ],
    "correctAnswer": 0
  },
  {
    "id": 18,
    "text": "Saodat opaning kasali?",
    "options": [
      "Oshqozon raki",
      "Yurak kasali",
      "Qon bosimi",
      "Gripp"
    ],
    "correctAnswer": 0
  },
  {
    "id": 19,
    "text": "Mashhur Oxunjon qiziq shogirdi Yusufjon qiziqqa qayerda yutqazgan edi?",
    "options": [
      "Mingbuloqda",
      "Toshkentda",
      "Chimyonda",
      "Qo'qonda"
    ],
    "correctAnswer": 0
  },
  {
    "id": 20,
    "text": "Chapani, janjalkash deya tasvirlangan obraz?",
    "options": [
      "Yusuf aka",
      "G'afurjon aka",
      "Tursunali",
      "Abdullajon"
    ],
    "correctAnswer": 0
  },
  {
    "id": 21,
    "text": "Gulchehraning ukasi kim?",
    "options": [
      "Alisher",
      "Qosimjon",
      "Abdulla",
      "Po'lat"
    ],
    "correctAnswer": 0
  },
  {
    "id": 22,
    "text": "Qachonlardir qayer Qo'qonning, qolaversa butun Farg'onaning eng go'zal sayilgohlaridan bo'lgan?",
    "options": [
      "Mingbuloq",
      "Chimyon",
      "Toshkent",
      "Parkent"
    ],
    "correctAnswer": 0
  },
  {
    "id": 23,
    "text": "Abdullaning mahallasi qayerda edi?",
    "options": [
      "Toshkent markazida Yangiobod mahallada",
      "Mingbuloq markazida",
      "Parkentda",
      "O'ratepada"
    ],
    "correctAnswer": 0
  },
  {
    "id": 24,
    "text": "Gafurjon aka qayerlik edi? (Asli parkentlik otasi bn tunukasozlik qilgan, otasi vafotidan keyin Toshkentga kelgan)",
    "options": [
      "Parkentlik",
      "Toshkentlik",
      "Mingbuloqlik",
      "O'ratepalik"
    ],
    "correctAnswer": 0
  },
  {
    "id": 25,
    "text": "Gafurjon aka qayerlik edi?",
    "options": [
      "Asli parkentlik",
      "Toshkentlik",
      "Fargonalik",
      "Qoqonlik"
    ],
    "correctAnswer": 0
  },
  {
    "id": 26,
    "text": "Husanxon qayerda maktab ochgan?",
    "options": [
      "Toshkentda",
      "Yangiobodda",
      "Parkentda",
      "Farg'onada"
    ],
    "correctAnswer": 1
  },
  {
    "id": 27,
    "text": "Og'ir o'lchab bir kesadigan deya ta'rif berilgan obraz kim?",
    "options": [
      "Husanxon",
      "Abdulla",
      "G'afurjon aka",
      "Obid aka"
    ],
    "correctAnswer": 2
  },
  {
    "id": 28,
    "text": "Firavn to'qigan gilam qanchaga sotildi?",
    "options": [
      "5 ming dinor",
      "10 ming dinor",
      "15 ming dinor",
      "20 ming dinor"
    ],
    "correctAnswer": 1
  },
  {
    "id": 29,
    "text": "Shohning o'g'li 2 oyligida necha yoshli bolaning ishini qilatdi?",
    "options": [
      "1 yoshli",
      "2 yoshli",
      "3 yoshli",
      "4 yoshli"
    ],
    "correctAnswer": 1
  },
  {
    "id": 30,
    "text": "Shoh o'g'li necha yoshida o'zini fir'avn deb elon qiladi?",
    "options": [
      "5 yoshida",
      "8 yoshida",
      "10 yoshida",
      "12 yoshida"
    ],
    "correctAnswer": 2
  },
  {
    "id": 31,
    "text": "G'afurjon akani asalariga o'xshatgan kim?",
    "options": [
      "Zavod aya-Hojar buvi",
      "Gulchehra",
      "Abdulla",
      "Husanxon"
    ],
    "correctAnswer": 0
  },
  {
    "id": 32,
    "text": "G'afurjon Husanxon bilan qanchadan beri do'st edi?",
    "options": [
      "10 yil",
      "20 yil",
      "30 yil",
      "40 yil"
    ],
    "correctAnswer": 2
  },
  {
    "id": 33,
    "text": "Qishloq aholisi uchun otinbibi kim edi?",
    "options": [
      "Hojar buvi",
      "Zavod aya",
      "Gulchehra",
      "Zavod aya-Hojar buvi"
    ],
    "correctAnswer": 3
  },
  {
    "id": 34,
    "text": "Tursun nechanchi farzand?",
    "options": [
      "3-farzand",
      "4-farzand",
      "5-farzand",
      "6-farzand"
    ],
    "correctAnswer": 2
  },
  {
    "id": 35,
    "text": "Hojar buvi kimxob kamzulini kimga atab qo'ygan edi?",
    "options": [
      "Gulchehraga",
      "Buvinisaga",
      "Zahroga",
      "Tursunga"
    ],
    "correctAnswer": 1
  },
  {
    "id": 36,
    "text": "Kim uzoq yashadi, ammo na tushida, na o'ngida hayot lazzatini surdi butun umri yolg'izlikda o'tdi, azob-uqubatda o'tdi?",
    "options": [
      "Shoh Muslimning o'g'li",
      "G'afurjon aka",
      "Obid aka",
      "Mannop rais"
    ],
    "correctAnswer": 0
  },
  {
    "id": 37,
    "text": "Obid aka nima lavozimda ishlardi?",
    "options": [
      "Traktorchilar boshlig'i",
      "Rais",
      "Aravakash",
      "Usto"
    ],
    "correctAnswer": 0
  },
  {
    "id": 38,
    "text": "Yoshligida otdan yiqilib, oyog'i singan va umrbod cho'loq bo'lib qolgan kim edi?",
    "options": [
      "Obid aka",
      "G'afurjon aka",
      "Mannop rais",
      "Husanxon"
    ],
    "correctAnswer": 2
  },
  {
    "id": 39,
    "text": "G'afurjon akaning kasali nima edi?",
    "options": [
      "Yurak",
      "Gipertoniya",
      "Qandli diabet",
      "Oshqozon"
    ],
    "correctAnswer": 1
  },
  {
    "id": 40,
    "text": "Homidning kasbi nima edi?",
    "options": [
      "Traktorchi",
      "Aravakash",
      "Temirchi",
      "Savdogar"
    ],
    "correctAnswer": 1
  },
  {
    "id": 41,
    "text": "Har bir oilaning kami kostidan xabardor obraz?",
    "options": [
      "Husanxon",
      "Obid aka",
      "G'afurjon aka",
      "Mannop rais"
    ],
    "correctAnswer": 2
  },
  {
    "id": 42,
    "text": "Abdullaning yuragiga umr sanchilib qolgan gapni kim aytdi?",
    "options": [
      "Arifmetika ustozi",
      "G'afurjon aka",
      "Husanxon",
      "Otasi"
    ],
    "correctAnswer": 0
  },
  {
    "id": 43,
    "text": "Abdulla uchun hayot ramzi, kelajak kaliti?",
    "options": [
      "Kitob",
      "Medal",
      "Qalam",
      "Maktab"
    ],
    "correctAnswer": 1
  },
  {
    "id": 44,
    "text": "Kimnikida burgut bor edi?",
    "options": [
      "Dadavoy",
      "Obid aka",
      "G'afurjon aka",
      "Homid"
    ],
    "correctAnswer": 0
  },
  {
    "id": 45,
    "text": "Asarda kim Tito Gobbi aruyasini sevardi?",
    "options": [
      "Gulchehra",
      "Sayyora",
      "Zahro",
      "Buvinisa"
    ],
    "correctAnswer": 1
  },
  {
    "id": 46,
    "text": "Obid akaning itining laqabi nima edi?",
    "options": [
      "Qoplon",
      "Teshavoy",
      "Bo'ri",
      "Sulton"
    ],
    "correctAnswer": 1
  },
  {
    "id": 47,
    "text": "Birovniki xuddi entikkan yurak urushiday dukillaydi, birovniki esa qizitilmagan chirmandaday taqillaydi ta'rif nima haqida?",
    "options": [
      "Soatlar",
      "Zontlar, soyabonlar",
      "Eshiklar",
      "Poyabzallar"
    ],
    "correctAnswer": 1
  },
  {
    "id": 48,
    "text": "Hayotdan yuksak qonun yo'q fikr kimniki?",
    "options": [
      "Lomonosov",
      "G'afurjon aka",
      "Husanxon",
      "Abdulla"
    ],
    "correctAnswer": 0
  },
  {
    "id": 49,
    "text": "Kimning xotini xomilasini oldirgan edi?",
    "options": [
      "Viktorning",
      "Qosimning",
      "Abdullaning",
      "Samadning"
    ],
    "correctAnswer": 0
  },
  {
    "id": 50,
    "text": "Viktorning qizining ismi kim?",
    "options": [
      "Gulchehra",
      "Sveta",
      "Zubayda",
      "Sanobar"
    ],
    "correctAnswer": 1
  },
  {
    "id": 51,
    "text": "Kim katta bo'lsa me'mor bo'lmoqchi edi?",
    "options": [
      "Abdulla",
      "Qosim",
      "Gulchehra",
      "Viktor"
    ],
    "correctAnswer": 2
  },
  {
    "id": 52,
    "text": "Kim Chilonzorda turadi, 1 o'g'il 1 qizi bor edi?",
    "options": [
      "Sanobar",
      "Gulchehra",
      "Zubayda",
      "Shahodat opa"
    ],
    "correctAnswer": 0
  },
  {
    "id": 53,
    "text": "Kimnikida Gulchehra turgandi shaharda?",
    "options": [
      "Dadavoy amakinikida",
      "Abstutay kampirnikida",
      "Samadnikida",
      "Yusuf akanikida"
    ],
    "correctAnswer": 1
  },
  {
    "id": 54,
    "text": "Qosimni kursdoshini ismi kim edi?",
    "options": [
      "Zubayda",
      "Sanobar",
      "Gulchehra",
      "Shahodat"
    ],
    "correctAnswer": 0
  },
  {
    "id": 55,
    "text": "Yig'i hech mahal odamga yordam bergan emas, qancha sovuqqonlik qilsangiz shuncha yutasiz. ASAB Yigi ojizlarning udumi kimning tilidan aytilgan?",
    "options": [
      "Tramvaydagi mo'ysafid",
      "Abdulla",
      "Qosim",
      "Samad"
    ],
    "correctAnswer": 0
  },
  {
    "id": 56,
    "text": "Obid aka va Abdulla bedazorda nechta bedana otishadi?",
    "options": [
      "15 ta",
      "20 ta",
      "25 ta",
      "30 ta"
    ],
    "correctAnswer": 2
  },
  {
    "id": 57,
    "text": "Gulchehra Abdullaning uylanishini kimdan eshitadi?",
    "options": [
      "Shahodat opadan",
      "Qosimdan",
      "Samaddan",
      "Obid akadan"
    ],
    "correctAnswer": 0
  },
  {
    "id": 58,
    "text": "Asarda shaxmat taxtasiga nima o'xshatilgan?",
    "options": [
      "Chiroq",
      "Uy",
      "Daraxt",
      "Kitob"
    ],
    "correctAnswer": 0
  },
  {
    "id": 59,
    "text": "Gulchehra kimdan qo'rqardi, ko'zi yomon derdi?",
    "options": [
      "Samad",
      "Dadavoy",
      "Qosim",
      "Abdulla"
    ],
    "correctAnswer": 1
  },
  {
    "id": 60,
    "text": "Zubayda praktikadan qachon qaytdi?",
    "options": [
      "Gulchehra vafotidan 1 kun keyin",
      "Gulchehra vafotidan 3 kundan keyin",
      "Gulchehra vafotidan 1 hafta keyin",
      "To'y kuni"
    ],
    "correctAnswer": 1
  },
  {
    "id": 61,
    "text": "Kimning Ukrainada urushda qahramonlarcha halok bo'lganini Abdulla yozda, kanikulda eshitgandi?",
    "options": [
      "Dadavoy amakini",
      "Samadni",
      "Qosimni",
      "Obid akani"
    ],
    "correctAnswer": 0
  },
  {
    "id": 62,
    "text": "Bu ko'zlar unga tana qilmasdi, yo'q ular unga Mehr bn boqardi, ular sevgiga sevinchga limmo-lim edi kimning ko'zi tasvirlangan?",
    "options": [
      "Gulchehra",
      "Zubayda",
      "Sanobar",
      "Shahodat"
    ],
    "correctAnswer": 0
  },
  {
    "id": 63,
    "text": "Tirigida xo'rlading, o'lganida tinch qo'y deb kim Abdullaga aytadi?",
    "options": [
      "Samad",
      "Dadavoy",
      "Qosim",
      "Obid aka"
    ],
    "correctAnswer": 0
  },
  {
    "id": 64,
    "text": "Oziniki bo'lmagan ikki bolani o'zinikiday ko'rgan qahramon kim edi?",
    "options": [
      "Zumrad opa",
      "Sanobar",
      "Shahodat",
      "Zubayda"
    ],
    "correctAnswer": 0
  },
  {
    "id": 65,
    "text": "Kimning bir shifokor bo'lgisi, bir muhandis yana bir qarasa me'mor bo'lgisi kelardi?",
    "options": [
      "Gulchehra",
      "Abdulla",
      "Qosim",
      "Zubayda"
    ],
    "correctAnswer": 0
  },
  {
    "id": 66,
    "text": "Maktabni tugatganlarga ziyofatni kim qilib berayotgan edi?",
    "options": [
      "Raisning o'zi",
      "Abdulla",
      "Qosim",
      "Samad"
    ],
    "correctAnswer": 0
  },
  {
    "id": 67,
    "text": "Gulchehra va Abdulla ilk uchrashgan manzil qayer edi?",
    "options": [
      "Jo'xorizor",
      "Maktab",
      "Kutubxona",
      "Bog'"
    ],
    "correctAnswer": 0
  },
  {
    "id": 68,
    "text": "Ziyofatda kim va'zxonlik qilardi?",
    "options": [
      "Qosim",
      "Abdulla",
      "Samad",
      "Obid aka"
    ],
    "correctAnswer": 0
  },
  {
    "id": 69,
    "text": "Qosimjon kimni bolalarga Toshkentdan tashrif buyurgan, maktabni oltin medalga tamomlagan deb tanishtiradi?",
    "options": [
      "Abdulla Sharipovni",
      "Samadni",
      "Dadavoyni",
      "Obid akani"
    ],
    "correctAnswer": 0
  },
  {
    "id": 70,
    "text": "Samad qaysi universitetda sirtdan o'qimoqchi edi?",
    "options": [
      "Qishloq xo'jaligi",
      "Pedagogika",
      "Tibbiyot",
      "Politexnika"
    ],
    "correctAnswer": 0
  },
  {
    "id": 71,
    "text": "Kim Pedagogika institutining til va adabiyot fakultetida o'qimoqchi edi?",
    "options": [
      "Qosimjon",
      "Abdulla",
      "Samad",
      "Inomjon"
    ],
    "correctAnswer": 0
  },
  {
    "id": 72,
    "text": "Kim valsga yaxshi tushardi, maktabda undan o'tadigani yo'q edi?",
    "options": [
      "Qosimjon",
      "Abdulla",
      "Samad",
      "Inomjon"
    ],
    "correctAnswer": 1
  },
  {
    "id": 73,
    "text": "Abdulla uchun kimning soyasi ham o'ziga o'xshagan chiroyli edi?",
    "options": [
      "Gulchehra",
      "Anbar",
      "Saodat",
      "Hojar buvi"
    ],
    "correctAnswer": 0
  },
  {
    "id": 74,
    "text": "Kim anchagina o'qimishli ayol bo'lib, Anbarotinga ergashib g'azallar bitgan edi?",
    "options": [
      "Gulchehra",
      "Saodat opa",
      "Hojar buvi",
      "Zavod aya"
    ],
    "correctAnswer": 3
  },
  {
    "id": 75,
    "text": "Kim badjahl, innankeyin eski toifadagi kishilardan edi?",
    "options": [
      "Yusuf aka",
      "G'afurjon aka",
      "Nurmat aka",
      "Tursunali aka"
    ],
    "correctAnswer": 0
  },
  {
    "id": 76,
    "text": "Agar uni kimdir urishadigan bo'lsa, yomon ko'z bn qaraydigan bo'lsa, tinchligi buzilardi?",
    "options": [
      "Qosimjon",
      "Abdulla",
      "Samad",
      "Gulchehra"
    ],
    "correctAnswer": 1
  },
  {
    "id": 77,
    "text": "Kim pulsiz, kiyimsiz, bitta ko'ylak shimda uyidan chiqib ketadi?",
    "options": [
      "Qosimjon",
      "Abdulla",
      "Samad",
      "Inomjon"
    ],
    "correctAnswer": 0
  },
  {
    "id": 78,
    "text": "Abdulla xatosini Kim kechirishi mumkin deya o'ylaydi?",
    "options": [
      "Onasi",
      "Otasi",
      "Gulchehra",
      "Do'stlari"
    ],
    "correctAnswer": 1
  },
  {
    "id": 79,
    "text": "Kimning bir og'iz gapi Abdullani yer bn yakson qiladi?",
    "options": [
      "Nurmat aka",
      "Yusuf aka",
      "Tursunali aka",
      "G'afurjon aka"
    ],
    "correctAnswer": 2
  },
  {
    "id": 80,
    "text": "Saodat opa necha yoshda vafot etadi?",
    "options": [
      "36 yoshida",
      "40 yoshida",
      "45 yoshida",
      "50 yoshida"
    ],
    "correctAnswer": 0
  },
  {
    "id": 81,
    "text": "Saodat opani kasalidan faqat necha kishi xabardor edi?",
    "options": [
      "2 kishi",
      "3 kishi",
      "4 kishi",
      "5 kishi"
    ],
    "correctAnswer": 2
  },
  {
    "id": 82,
    "text": "Urush yillarida kim erining kiyimlarini kiyib traktor haydardi?",
    "options": [
      "Gulchehra",
      "Saodat opa",
      "Hojar buvi",
      "Anbar"
    ],
    "correctAnswer": 1
  },
  {
    "id": 83,
    "text": "Onasi traktor haydaganda Gulchehra necha yoshda edi?",
    "options": [
      "3 yosh",
      "4 yosh",
      "5 yosh",
      "6 yosh"
    ],
    "correctAnswer": 2
  },
  {
    "id": 84,
    "text": "Gulchehra tushida ko'rgan biram katta, biram chiroyli shahar qaysi edi (onasiga aytib berayotganida)?",
    "options": [
      "Toshkent",
      "Samarqand",
      "Buxoro",
      "Moskva"
    ],
    "correctAnswer": 3
  },
  {
    "id": 85,
    "text": "Abdulla qishloqqa 3-4 kunga kelib necha kun qolib ketadi?",
    "options": [
      "7 kun",
      "10 kun",
      "14 kun",
      "20 kun"
    ],
    "correctAnswer": 1
  },
  {
    "id": 86,
    "text": "Kimning jahli chiqsa shunaqa mo'ylovi xuddi sichqonning dumiday likillay boshlaydi?",
    "options": [
      "Nurmat aka",
      "Yusuf aka",
      "G'afurjon aka",
      "Tursunali aka"
    ],
    "correctAnswer": 0
  },
  {
    "id": 87,
    "text": "Mingbuloq maketini kimlar yasaydi?",
    "options": [
      "Abdulla va Qosimjon",
      "Samad va Gulchehra",
      "Inomjon va Abdulla",
      "Qosimjon va Gulchehra"
    ],
    "correctAnswer": 1
  },
  {
    "id": 88,
    "text": "Birorta to'y maraka kimsiz o'tmas, mahallaning deyarli katta-kichigi uning maslahati bn ish tutardi?",
    "options": [
      "Yusuf aka",
      "Nurmat aka",
      "G'afurjon aka",
      "Tursunali aka"
    ],
    "correctAnswer": 2
  },
  {
    "id": 89,
    "text": "G'afurjon aka maktabda qanday lavozimda ishlaydi?",
    "options": [
      "Direktor",
      "O'qituvchi",
      "Xo'jalik ishlarini boshqaradi",
      "Kutubxonachi"
    ],
    "correctAnswer": 2
  },
  {
    "id": 90,
    "text": "G'afur aka Tunukasozlik artelida director bb necha yil ishlaydi?",
    "options": [
      "5 yildan ortiq",
      "8 yildan ortiq",
      "10 yildan ortiq",
      "15 yildan ortiq"
    ],
    "correctAnswer": 2
  },
  {
    "id": 91,
    "text": "G'afur aka keyin qayerga ishga o'tadi?",
    "options": [
      "Maktabga",
      "Tuman savdo boshqarmasiga",
      "Qishloq xo'jaligiga",
      "Zavodga"
    ],
    "correctAnswer": 1
  },
  {
    "id": 92,
    "text": "G'afur akaniong mehnatga oid nechta ertagi bor edi?",
    "options": [
      "1 ta",
      "2 ta",
      "3 ta",
      "4 ta"
    ],
    "correctAnswer": 1
  },
  {
    "id": 93,
    "text": "Abdulla nechanchi sinfgacha har yili maqtov qog'ozi olib o'qirdi?",
    "options": [
      "5-sinfgacha",
      "6-sinfgacha",
      "7-sinfgacha",
      "8-sinfgacha"
    ],
    "correctAnswer": 2
  },
  {
    "id": 94,
    "text": "Inomjonning otasi kurortga qayerga ketayotgandi?",
    "options": [
      "Kislavodsk",
      "Toshkent",
      "Moskva",
      "Leningrad"
    ],
    "correctAnswer": 0
  },
  {
    "id": 95,
    "text": "Qaysi fan Abdulla uchun qiynoq soatidek tuyilardi?",
    "options": [
      "Fizika",
      "Matematika",
      "Ona tili",
      "Adabiyot"
    ],
    "correctAnswer": 2
  },
  {
    "id": 96,
    "text": "Inomning otasi qayerda ishlardi?",
    "options": [
      "Tuman ijroqo‘mi raisi",
      "Maktab direktori",
      "Savdo boshqarmasi",
      "Artel"
    ],
    "correctAnswer": 0
  },
  {
    "id": 97,
    "text": "G‘afur akaga doktorlar qanday sho‘rva ichishni buyurgandi?",
    "options": [
      "Tuzsiz tovuq sho‘rva",
      "Tuzsiz kaptar sho‘rva",
      "Qo‘y sho‘rva",
      "Sabzavotli sho‘rva"
    ],
    "correctAnswer": 1
  },
  {
    "id": 98,
    "text": "Kim ozg‘in ingichka oyoqli qizlarni xush ko‘rmasdi?",
    "options": [
      "Inom",
      "Abdulla",
      "Tursunali",
      "Po‘lat"
    ],
    "correctAnswer": 1
  },
  {
    "id": 99,
    "text": "Abdullaga kim har kimning o‘z yulduzi bo‘ladi deb aytgan edi?",
    "options": [
      "Otasi",
      "Onasi",
      "Buvisi",
      "O‘qituvchisi"
    ],
    "correctAnswer": 2
  },
  {
    "id": 100,
    "text": "Hojar buvining nechta farzandi bor edi?",
    "options": [
      "1 ta",
      "2 ta",
      "3 ta",
      "4 ta"
    ],
    "correctAnswer": 1
  },
  {
    "id": 101,
    "text": "Abdullaning yulduzi necha qirrali edi?",
    "options": [
      "4 qirrali",
      "5 qirrali",
      "6 qirrali",
      "8 qirrali"
    ],
    "correctAnswer": 2
  },
  {
    "id": 102,
    "text": "Abdullaning yulduzi oydan qancha masofa uzoqlikda, Zuhradan balandda edi?",
    "options": [
      "10 qarich",
      "12 qarich",
      "15 qarich",
      "20 qarich"
    ],
    "correctAnswer": 1
  },
  {
    "id": 103,
    "text": "Bolalar Chimyonga borishganida kimning otasi qo‘y so‘yib kabob qilib beradi, 2 kun yeyishadi?",
    "options": [
      "Inomning",
      "Ahrorning",
      "Abdullaning",
      "Po‘latning"
    ],
    "correctAnswer": 1
  },
  {
    "id": 104,
    "text": "Tursunali aka necha yildan beri Leningradda yashardi?",
    "options": [
      "1 yil",
      "2 yil",
      "3 yil",
      "5 yil"
    ],
    "correctAnswer": 1
  },
  {
    "id": 105,
    "text": "Abdulla yozma matematikani necha minutda topshirib chiqardi?",
    "options": [
      "15 minutda",
      "20 minutda",
      "30 minutda",
      "45 minutda"
    ],
    "correctAnswer": 1
  },
  {
    "id": 106,
    "text": "Tursunali artelda qanday lavozimda ishlagan edi?",
    "options": [
      "Direktor",
      "Ekspeditor",
      "Hisobchi",
      "Hammol"
    ],
    "correctAnswer": 1
  },
  {
    "id": 107,
    "text": "Tursunali aka O‘ratepadan qochib kelib qiynalib bozorda nima ish qilgandi?",
    "options": [
      "Savdogarlik",
      "Hammolchilik",
      "Qorovullik",
      "Haydovchilik"
    ],
    "correctAnswer": 1
  },
  {
    "id": 108,
    "text": "Abdulla Leningradda necha yilga boradi?",
    "options": [
      "3 yil",
      "4 yil",
      "5 yil",
      "6 yil"
    ],
    "correctAnswer": 2
  },
  {
    "id": 109,
    "text": "Qayerda o‘qish ko‘pchilik yetisholmayotgan orzu edi?",
    "options": [
      "Toshkentda",
      "Leningradda",
      "Moskvada",
      "Samarqandda"
    ],
    "correctAnswer": 1
  },
  {
    "id": 110,
    "text": "Kim birovning shamoliga ham shamollab qoladi?",
    "options": [
      "Abdulla",
      "Po‘lat",
      "Rustam",
      "Inom"
    ],
    "correctAnswer": 2
  },
  {
    "id": 111,
    "text": "Yana kim oltin medal olib Leningradga ketayotgandi?",
    "options": [
      "Inom",
      "Po‘lat",
      "Rustam",
      "Ahror"
    ],
    "correctAnswer": 1
  },
  {
    "id": 112,
    "text": "Kimning ovozi xuddi qizlarnikiga o‘xshardi?",
    "options": [
      "Abdulla",
      "Po‘lat",
      "Rustam",
      "Inom"
    ],
    "correctAnswer": 1
  },
  {
    "id": 113,
    "text": "Kim Leningradda o‘qishga dadasi qarshilik qilsalar ham ketayotgan edi?",
    "options": [
      "Abdulla",
      "Po‘lat",
      "Rustam",
      "Inom"
    ],
    "correctAnswer": 1
  },
  {
    "id": 114,
    "text": "Yadrofizika instituti ochilganiga qancha bo‘lgan edi?",
    "options": [
      "1 yil",
      "2 yil",
      "3 yil",
      "5 yil"
    ],
    "correctAnswer": 1
  },
  {
    "id": 115,
    "text": "Abdulla qayerda o‘qishni mo‘ljallab turgandi?",
    "options": [
      "Leningrad",
      "SAGU Fizmat",
      "Moskva",
      "Toshkent"
    ],
    "correctAnswer": 1
  },
  {
    "id": 116,
    "text": "Yaxshi odamlar tez kasalga chalinadilar yomon odamlarga balo ham urmaydi jumlasi kimni tilidan aytilgan?",
    "options": [
      "Abdulla",
      "Tursunali aka",
      "Po‘lat",
      "Inom"
    ],
    "correctAnswer": 1
  },
  {
    "id": 117,
    "text": "Qanaqa choy qip qizil bo‘lib xushbo‘y hid taratib turardi?",
    "options": [
      "Qora choy",
      "Ko‘k choy",
      "Pamil",
      "Meva choy"
    ],
    "correctAnswer": 2
  },
  {
    "id": 118,
    "text": "Kim yolg‘iz qizining 4 yil begona shaharda qolib ketishidan cho‘chirdi?",
    "options": [
      "Sayyoraning onasi-Sanobar",
      "Abdullaning onasi",
      "Inomning otasi",
      "Tursunali aka"
    ],
    "correctAnswer": 0
  },
  {
    "id": 119,
    "text": "Kim uchun qiziga o'qishga yo'ldosh topish ikkinchi masala edi?",
    "options": [
      "Tursunali aka",
      "Sayyora",
      "Abdulla",
      "Samad"
    ],
    "correctAnswer": 0
  },
  {
    "id": 120,
    "text": "Sayyoraning eng yaxshi ko'radigan kuyi nima edi?",
    "options": [
      "Dunay to'lqinlari",
      "Fokstrot",
      "Valis",
      "Tango"
    ],
    "correctAnswer": 0
  },
  {
    "id": 121,
    "text": "Sayyora otasi sovg'a qilgan nimani quchoqlab uxlardi?",
    "options": [
      "Katta ayiq qo'g'irchog'ini",
      "Mushukcha",
      "Kitob",
      "Yostiq"
    ],
    "correctAnswer": 0
  },
  {
    "id": 122,
    "text": "Moskvada nuqul qaysi kuyga raqs tushishadi?",
    "options": [
      "Fokstrot",
      "Vals",
      "Tango",
      "Polka"
    ],
    "correctAnswer": 0
  },
  {
    "id": 123,
    "text": "Kimni matematikadan ko'ra fizika ko'proq qiziqtiradi?",
    "options": [
      "Sayyorani",
      "Abdullani",
      "Gulchehrani",
      "Samadni"
    ],
    "correctAnswer": 0
  },
  {
    "id": 124,
    "text": "Hozir Sayyora qaysi yozuvchi asarini o'qiyotgan edi?",
    "options": [
      "Xemenguey",
      "Pushkin",
      "Tolstoy",
      "Chexov"
    ],
    "correctAnswer": 0
  },
  {
    "id": 125,
    "text": "Abdulla nechanchi sanada leningradga jo'naydi?",
    "options": [
      "20-avgust",
      "15-avgust",
      "1-sentyabr",
      "10-avgust"
    ],
    "correctAnswer": 0
  },
  {
    "id": 126,
    "text": "Abdulla o'qishni bitirib birinchi qiladigan ishi nima bo'ladi?",
    "options": [
      "Uyini tuzatadi",
      "Uylanadi",
      "Ishga joylashadi",
      "Mashina oladi"
    ],
    "correctAnswer": 0
  },
  {
    "id": 127,
    "text": "Romanda nima hali hosili terilmagan bog'ni eslatardi?",
    "options": [
      "Qabriston",
      "Maktab",
      "Bog'",
      "Yotoqxona"
    ],
    "correctAnswer": 0
  },
  {
    "id": 128,
    "text": "Abdullalarning yotoqxonasi qaysi daryo yonida edi?",
    "options": [
      "Neva",
      "Volga",
      "Sirdaryo",
      "Amudaryo"
    ],
    "correctAnswer": 0
  },
  {
    "id": 129,
    "text": "Gulchehra qaysi institutga sirtdan hujjat topshiradi?",
    "options": [
      "Politexnika",
      "Pedagogika",
      "Tibbiyot",
      "Iqtisodiyot"
    ],
    "correctAnswer": 0
  },
  {
    "id": 130,
    "text": "Gulchehraning qaysi sirini faqat 3 kishi bilardi? (Mingbuloqni maketini yasash siri)",
    "options": [
      "Abdulla, Samad va o'zi",
      "Sayyora, Abdulla va o'zi",
      "Samad, Sayyora va o'zi",
      "Faqat Abdulla"
    ],
    "correctAnswer": 0
  },
  {
    "id": 131,
    "text": "Gulchehrada mingbuloqning maketini yasash qaysi paytda tug'ilgandi?",
    "options": [
      "2-kursni tugatganida",
      "1-kursda",
      "3-kursda",
      "Maktabda"
    ],
    "correctAnswer": 0
  },
  {
    "id": 132,
    "text": "Abdulla ta'tilga chiqib doim nechanchi sanada qishloqqa borardi?",
    "options": [
      "15-avgust",
      "20-avgust",
      "1-sentyabr",
      "30-avgust"
    ],
    "correctAnswer": 0
  },
  {
    "id": 133,
    "text": "Abdullaning maqolasi qaysi gazetada bosilmoqchi edi?",
    "options": [
      "Fan va turmush",
      "Yoshlik",
      "Haqiqat",
      "O'zbekiston ovozi"
    ],
    "correctAnswer": 0
  },
  {
    "id": 134,
    "text": "Abdullaning kurs ishi nomi nimaydi?",
    "options": [
      "Yuqori chastotalar haqida",
      "Fizika qonunlari",
      "Matematik analiz",
      "Yadro fizikasi"
    ],
    "correctAnswer": 0
  },
  {
    "id": 135,
    "text": "Toshkentda quriladigan qaysi mehmonxona loyihasiga tanlov e'lon qilingan edi?",
    "options": [
      "Yoshlik",
      "O'zbekiston",
      "Toshkent",
      "Intercontinental"
    ],
    "correctAnswer": 0
  },
  {
    "id": 136,
    "text": "Abdulla necha daqiqa suv tagida nafas olmay tura olardi?",
    "options": [
      "3 daqiqa",
      "1 daqiqa",
      "2 daqiqa",
      "5 daqiqa"
    ],
    "correctAnswer": 0
  },
  {
    "id": 137,
    "text": "Abdulla nechanchi kursga o'tganidan keyin yotoqxonadan nechanchi qavatdan alohida xona ajratib berishdi?",
    "options": [
      "5-kurs, 5-qavatdan",
      "4-kurs, 4-qavatdan",
      "3-kurs, 3-qavatdan",
      "2-kurs, 2-qavatdan"
    ],
    "correctAnswer": 0
  },
  {
    "id": 138,
    "text": "Kim Petropavlovsk qalasini, portga kirib chiqib turadigan kemalarni tomosha qilishni yoqtirardi?",
    "options": [
      "Sayyora",
      "Abdulla",
      "Gulchehra",
      "Samad"
    ],
    "correctAnswer": 0
  },
  {
    "id": 139,
    "text": "Sayyoraga kim o'g'lim bo'lganida majburlab bo'lsa ham seni kelin qilardim deb aytardi?",
    "options": [
      "Diplom ishi rahbari",
      "Otasi",
      "Onasi",
      "O'qituvchisi"
    ],
    "correctAnswer": 0
  },
  {
    "id": 140,
    "text": "Kim serxarajat bo'lsada ba'zi qizlardek molparast emas edi?",
    "options": [
      "Sayyora",
      "Gulchehra",
      "Abdullaning singlisi",
      "Samadning qizi"
    ],
    "correctAnswer": 0
  },
  {
    "id": 141,
    "text": "Kimning kiyimlari deyarli hammaniki edi, bazan nimasi bor yo'qligini ham bilolmay qolardi, hatto o'zini kiyishga hech narsasi qolmagan paytlari ham bo'lardi?",
    "options": [
      "Sayyora",
      "Gulchehra",
      "Abdulla",
      "Samad"
    ],
    "correctAnswer": 0
  },
  {
    "id": 142,
    "text": "O'tgan 4 yil kimni boshqacha qilib yubordi, ko'p o'qiydi, aqlli, tartib bn kiyinardi?",
    "options": [
      "Abdulla",
      "Sayyora",
      "Gulchehra",
      "Samad"
    ],
    "correctAnswer": 0
  },
  {
    "id": 143,
    "text": "Bolalar hazillashib kimni kelajak Eynshteyni deydi?",
    "options": [
      "Abdullani",
      "Sayyorani",
      "Samadni",
      "Gulchehrani"
    ],
    "correctAnswer": 0
  },
  {
    "id": 144,
    "text": "Kimning kiyimlari deyarli hammaniki edi, bazan nimasi bor yo'qligini ham bilolmay qolardi, hatto o'zini kiyishga hech narsasi qolmagan paytlari ham bo'lardi?",
    "options": [
      "Sayyora",
      "Gulchehra",
      "Karomat opa",
      "Saodat opa"
    ],
    "correctAnswer": 0
  },
  {
    "id": 145,
    "text": "O'tgan 4 yil kimni boshqacha qilib yubordi, ko'p o'qiydi, aqlli, tartib bn kiyinardi?",
    "options": [
      "Abdulla",
      "Samad",
      "Nurmat",
      "Obid"
    ],
    "correctAnswer": 0
  },
  {
    "id": 146,
    "text": "Bolalar hazillashib kimni kelajak Eynshteyni deydi?",
    "options": [
      "Samad",
      "Abdullani",
      "Obidni",
      "Nurmatni"
    ],
    "correctAnswer": 1
  },
  {
    "id": 147,
    "text": "Abdulla kimga doim hurmat bn qarab, uni o'zidan baland qo'yardi?",
    "options": [
      "Sayyora",
      "Gulchehra",
      "Karomat opa",
      "Saodat opa"
    ],
    "correctAnswer": 0
  },
  {
    "id": 148,
    "text": "Kim turmush qurishda sevgini bo'lishini istardi, sevgisiz hayotni tasavvur etolmasdi, bunday hayotning bo'lganidan bo'lmagani yaxshi edi?",
    "options": [
      "Gulchehra",
      "Sayyora",
      "Karomat opa",
      "Saodat opa"
    ],
    "correctAnswer": 1
  },
  {
    "id": 149,
    "text": "Po'lat kimni ishlash uchun yaratilgan odam deydi?",
    "options": [
      "Abdullani",
      "Samadni",
      "Obidni",
      "Nurmatni"
    ],
    "correctAnswer": 0
  },
  {
    "id": 150,
    "text": "Abdullaning taklifi bn shahardagi qaysi qadimiy restoranga kirishadi?",
    "options": [
      "Sharq",
      "Astoriya",
      "O'zbekiston",
      "Bahor"
    ],
    "correctAnswer": 1
  },
  {
    "id": 151,
    "text": "Restoranda kim Nikolay II ga o'xshab ketardi?",
    "options": [
      "Ofitsiant",
      "Mijoz",
      "Shveysar chol",
      "Restoran direktori"
    ],
    "correctAnswer": 2
  },
  {
    "id": 152,
    "text": "Sayyoraning eng yaxshi odatidan biri nima edi?",
    "options": [
      "Ko'p o'qishi",
      "O'zining mavqeyi bn g'ururlanmaydi",
      "Chiroyli kiyinishi",
      "Mehmondo'stligi"
    ],
    "correctAnswer": 1
  },
  {
    "id": 153,
    "text": "Abdulla uchun kim chiqib bo'lmaydigan qoyaning usti edi?",
    "options": [
      "Gulchehra",
      "Sayyora",
      "Karomat opa",
      "Saodat opa"
    ],
    "correctAnswer": 1
  },
  {
    "id": 154,
    "text": "Gulchehra Saidovaning diplom ishi nima edi?",
    "options": [
      "Qishloq maketi",
      "Mingbuloq maketi",
      "Shahar maketi",
      "Zavod maketi"
    ],
    "correctAnswer": 1
  },
  {
    "id": 155,
    "text": "Kim Toshkentga borganida tovutni derazadan ip bn tortib tushirayotganini ko'rgan, o'zbekka bir parcha bo'lsa ham yer kerak, hojatga chiqsa ham hovliga chiqsin deydi?",
    "options": [
      "Qobil aka",
      "Yusuf aka",
      "Abdulla",
      "Samad"
    ],
    "correctAnswer": 0
  },
  {
    "id": 156,
    "text": "Qishloqda necha kishilik yasli qurilishi boshlanadi?",
    "options": [
      "40 kishilik",
      "50 kishilik",
      "60 kishilik",
      "80 kishilik"
    ],
    "correctAnswer": 2
  },
  {
    "id": 157,
    "text": "Madaniyat saroyi bitganida kuniga necha mahal kino bo'ladi deyiladi?",
    "options": [
      "1 mahal",
      "2 mahal",
      "3 mahal",
      "4 mahal"
    ],
    "correctAnswer": 1
  },
  {
    "id": 158,
    "text": "Gulchehra yoshligida mol boqib yurganlarida qanday o'yin o'ynaganini eslaydi?",
    "options": [
      "Qizlar o'yini",
      "Hammompish",
      "Yashirinmachoq",
      "Arqon tortish"
    ],
    "correctAnswer": 1
  },
  {
    "id": 159,
    "text": "Samadning yoqtirgan qizi kim edi?",
    "options": [
      "Sayyora",
      "Gulchehra",
      "Karomat opa",
      "Saodat opa"
    ],
    "correctAnswer": 1
  },
  {
    "id": 160,
    "text": "Yusuf akaning 2-xotini Zumrad opa qayerdagi akasini ko'rgani 1 haftaga Alisher bn ketadi?",
    "options": [
      "Toshkentga",
      "Oltiariqqa",
      "Farg'onaga",
      "Namanganga"
    ],
    "correctAnswer": 1
  },
  {
    "id": 161,
    "text": "Kim oddiy qiz emas edi, u bn hayotini bog'lagan odam ko'p narsaga yetishishi mumkin?",
    "options": [
      "Sayyora",
      "Gulchehra",
      "Karomat opa",
      "Saodat opa"
    ],
    "correctAnswer": 0
  },
  {
    "id": 162,
    "text": "Abdullaga kim “olim bo'lish oson, odam bo'lish qiyin” degan edi?",
    "options": [
      "Otasi",
      "Akasi",
      "Tog'asi Obid",
      "Ustoz"
    ],
    "correctAnswer": 2
  },
  {
    "id": 163,
    "text": "Abdulla Gulchehrani o'ylaganida qaysi ko'chada yurganlarini hayoliga keltirardi?",
    "options": [
      "Navoiy",
      "Saylgoh",
      "Mustaqillik",
      "Amir Temur"
    ],
    "correctAnswer": 1
  },
  {
    "id": 164,
    "text": "Kim o ’ zini to ’ qayda adashib qolgan ovchidek sezardi, na boshi na oxiri qayoqqa yurishni bilmasdi?",
    "options": [
      "Abdulla",
      "Nurmat aka",
      "Samad",
      "Viktor"
    ],
    "correctAnswer": 0
  },
  {
    "id": 165,
    "text": "Gulchehraning yonidan Nurmat aka va Samad qanday mashinada chiqib qolishadi?",
    "options": [
      "GAZ-69",
      "Volga",
      "Moskvich",
      "Zhiguli"
    ],
    "correctAnswer": 0
  },
  {
    "id": 166,
    "text": "Saodat opaning qabriga qayerdan qabrtosh keltirishayotgan edi?",
    "options": [
      "Toshkent",
      "Rigadan",
      "Samarqand",
      "Buxoro"
    ],
    "correctAnswer": 1
  },
  {
    "id": 167,
    "text": "Kim Abdullaga kafedrada qolish taklifini beradi?",
    "options": [
      "Talabalar",
      "Kafedra mudiri professor Markov",
      "Rektor",
      "Dekan"
    ],
    "correctAnswer": 1
  },
  {
    "id": 168,
    "text": "Abdulla kursdoshi Viktorni qayerda uchratib qoladi?",
    "options": [
      "Universitetda",
      "Neva kinoteatr ko ’ chasida",
      "Bog ’ da",
      "Bekatda"
    ],
    "correctAnswer": 1
  },
  {
    "id": 169,
    "text": "Gulchehra kim bn obodonchilik loyihalash institutida ishlardi?",
    "options": [
      "Sanobar",
      "Saodat",
      "Zara",
      "Zubayda"
    ],
    "correctAnswer": 0
  },
  {
    "id": 170,
    "text": "Aeroflotda ishlaydigan styuardessa qiz edi, moskva mashrutida?",
    "options": [
      "Sanobar",
      "Gulchehra",
      "Zara",
      "Saodat"
    ],
    "correctAnswer": 2
  },
  {
    "id": 171,
    "text": "Sanobar oilasi bn qayerga ketgan edi?",
    "options": [
      "Issiqko ’ lga",
      "Moskvaga",
      "Toshkentga",
      "Samarqandga"
    ],
    "correctAnswer": 0
  },
  {
    "id": 172,
    "text": "Gulchehra birinchi Toshkentga kelganida kim uni Abstutay kampirnikiga joylashtirgan edi?",
    "options": [
      "Abdulla",
      "Qosimjon",
      "Nurmat",
      "Samad"
    ],
    "correctAnswer": 1
  },
  {
    "id": 173,
    "text": "Abstutay qayerda turardi?",
    "options": [
      "Chilonzorda",
      "Labzakda",
      "Yunusobodda",
      "Eski shaharda"
    ],
    "correctAnswer": 1
  },
  {
    "id": 174,
    "text": "Abstutay kampirning o ’ g ’ li qayerda ishlardi?",
    "options": [
      "Zavodda",
      "Buxoro – Ural magistral qurilishda",
      "Maktabda",
      "Do ’ konda"
    ],
    "correctAnswer": 1
  },
  {
    "id": 175,
    "text": "Abstutay kampir kim bn yashardi?",
    "options": [
      "O ’ g ’ li bilan",
      "Erkak bilan",
      "Nevarasi Zubayda",
      "Yolg ’ iz"
    ],
    "correctAnswer": 2
  },
  {
    "id": 176,
    "text": "Abstutayning kim ismli tanish shifokori bor edi?",
    "options": [
      "Sofiya",
      "Saodat",
      "Sanobar",
      "Zara"
    ],
    "correctAnswer": 0
  },
  {
    "id": 177,
    "text": "Gulchehra magazindan Abstutay kampirga qanday sovg ’ a oladi?",
    "options": [
      "Ro ’ mol",
      "Bir kiyimlik havo rangli sherst mato",
      "Ko ’ ylak",
      "Shirinlik"
    ],
    "correctAnswer": 1
  },
  {
    "id": 178,
    "text": "Gulchehra qanaqa shippag olishni orzu qilardi?",
    "options": [
      "Hind, chex shippagi",
      "Oddiy shippak",
      "Charm shippak",
      "Matoli shippak"
    ],
    "correctAnswer": 0
  },
  {
    "id": 179,
    "text": "Sulaymon ota kim edi?",
    "options": [
      "Shifokor",
      "Qorovul",
      "Muallim",
      "Haydovchi"
    ],
    "correctAnswer": 1
  },
  {
    "id": 180,
    "text": "Shahodat opa va Gulchehra qayerda uchrashib qolishadi?",
    "options": [
      "Parkda",
      "Univermagda xadrada",
      "Ko ’ chada",
      "Ishxonada"
    ],
    "correctAnswer": 1
  },
  {
    "id": 181,
    "text": "Gulchhera qaysi qo ’ shiqni yoqtirardi?",
    "options": [
      "Xalq qo ’ shig ’ ini",
      "Morobibos, botir zokirov aytganini",
      "Klassikani",
      "Zamonaviy"
    ],
    "correctAnswer": 1
  },
  {
    "id": 182,
    "text": "Kim hech mahal tunggi Toshknetni tomosha qilmagan edi?",
    "options": [
      "Abdulla",
      "Gulchehra",
      "Sanobar",
      "Saodat"
    ],
    "correctAnswer": 1
  },
  {
    "id": 183,
    "text": "Gulchehra bino balkonida yiqilayotganda oxirgi hayolidan o ’ tgan so ’ z nima edi?",
    "options": [
      "Yordam bering",
      "xuddi qushman-a",
      "Qo ’ rqyapman",
      "Onajon"
    ],
    "correctAnswer": 1
  },
  {
    "id": 184,
    "text": "Gulchehra binoga kelganida soat nechi edi?",
    "options": [
      "10:00",
      "11:00",
      "chorakam 12 edi tungi",
      "01:00"
    ],
    "correctAnswer": 2
  },
  {
    "id": 185,
    "text": "Gulchehra vafotidan keyin kim tildan qolgan edi?",
    "options": [
      "Abdulla",
      "Yusuf aka",
      "Abstutay",
      "Sanobar"
    ],
    "correctAnswer": 1
  },
  {
    "id": 186,
    "text": "Mingbuloqdagi pochtachi qiz kim edi?",
    "options": [
      "Mamlakat",
      "Zara",
      "Sanobar",
      "Zubayda"
    ],
    "correctAnswer": 0
  },
  {
    "id": 187,
    "text": "185.Abdullaga kim Gulchehraning o ’ limi haqida telegramma yuborib qo ’ ygandi?",
    "options": [
      "Mamlakat",
      "Yusuf aka",
      "Nurmat aka",
      "Saida"
    ],
    "correctAnswer": 0
  },
  {
    "id": 188,
    "text": "186.Begona yigit xotinining tug ’ ilgan kuniga qabnaqa sovg ’ a olgandi?",
    "options": [
      "Tilla uzuk",
      "Brilliant ko ’ zli uzuk",
      "Soat",
      "Gul dasta"
    ],
    "correctAnswer": 1
  },
  {
    "id": 189,
    "text": "187.Kim begona yigitga olim bo ’ lish oson odam bo ’ lish qiyin degandi?",
    "options": [
      "Yusuf aka",
      "Nurmat aka",
      "Xotini Saida",
      "Mamlakat"
    ],
    "correctAnswer": 2
  },
  {
    "id": 190,
    "text": "188.Begona yigit kim haqida yomon bo ’ lsa 2 bolani o ’ z bolasidek ko ’ rarmidi degan?",
    "options": [
      "Nurmat aka",
      "Xotini Saida",
      "Yusuf aka",
      "Abdulla"
    ],
    "correctAnswer": 1
  },
  {
    "id": 191,
    "text": "189. Yusuf aka va Zumrad opani kim tanishtirib qo ’ ygandi?",
    "options": [
      "Nurmat aka",
      "Saida",
      "Mamlakat",
      "Abdulla"
    ],
    "correctAnswer": 0
  },
  {
    "id": 192,
    "text": "190.Saida xafa bbo ’ lsa qayerda yurardi?",
    "options": [
      "Uyda",
      "Anhor bo ’ yida yo katta ko ’ chada",
      "Bog ’ da",
      "Ishxonada"
    ],
    "correctAnswer": 1
  }
];
export const variantSize = 30;

export const subjects: Subject[] = (subjectsData as Subject[]).map(s => {
  if (!s.questions || s.questions.length === 0) {
    return { ...s, questions: questionsList };
  }
  return s as Subject;
});

export const totalVariants = Math.ceil(questionsList.length / variantSize);

export const getQuestionsByVariant = (variant: number): Question[] => {
  const start = (variant - 1) * variantSize;
  const end = start + variantSize;
  return questionsList.slice(start, end);
};
