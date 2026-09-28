import {
  EXERCISE_MEDIA,
  RECIPE_PHOTOS,
  ROUTINE_PHOTOS,
  type ExerciseMediaKey,
} from "@/lib/media-library";
import { IMAGES } from "@/lib/images";

export type WorkoutExercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  muscle: string;
  tip: string;
  /** Vídeo demostrativo — solo presente si existe metraje del movimiento real */
  video?: string;
  videoPoster?: string;
  videoCredit?: string;
};

export type WorkoutRoutine = {
  userOwned?: boolean;
  dbId?: number;
  id: string;
  title: string;
  subtitle: string;
  category: "fuerza" | "hiit" | "hipertrofia" | "core";
  level: "Principiante" | "Intermedio" | "Avanzado";
  durationMinutes: number;
  caloriesBurned: number;
  image: string;
  accent: string;
  equipment: string;
  video?: string;
  videoPoster?: string;
  videoCredit?: string;
  exercises: WorkoutExercise[];
};

export type FitnessRecipe = {
  userOwned?: boolean;
  dbId?: number;
  id: string;
  title: string;
  subtitle: string;
  category: "proteina" | "definicion" | "energia" | "post-entreno";
  categoryLabel: string;
  prepMinutes: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  image: string;
  accent: string;
  ingredients: string[];
  steps: string[];
};

type BareExercise = Omit<WorkoutExercise, "video" | "videoPoster" | "videoCredit">;

/** Adjunta el vídeo verificado del movimiento. */
function vid(ex: BareExercise, key: ExerciseMediaKey): WorkoutExercise {
  const media = EXERCISE_MEDIA[key];
  return { ...ex, video: media.video, videoPoster: media.poster, videoCredit: media.credit };
}

/** Ejercicio sin vídeo: no hay metraje fiable de este movimiento concreto. */
function noVid(ex: BareExercise): WorkoutExercise {
  return ex;
}

function routineVideo(key: ExerciseMediaKey) {
  const media = EXERCISE_MEDIA[key];
  return { video: media.video, videoPoster: media.poster, videoCredit: media.credit };
}

export const WORKOUT_ROUTINES: WorkoutRoutine[] = [
  {
    id: "push-hypertrophy",
    title: "Empuje Brutal · Pecho, Hombro y Tríceps",
    subtitle: "Hipertrofia miofibrilar con control excéntrico y bombeo final",
    category: "hipertrofia",
    level: "Intermedio",
    durationMinutes: 50,
    caloriesBurned: 420,
    image: IMAGES.strength,
    accent: "from-fuchsia-500 to-violet-600",
    equipment: "Barra, mancuernas y polea",
    ...routineVideo("benchPress"),
    exercises: [
      vid(
        {
          id: "bench-press",
          name: "Press de banca con barra o mancuernas",
          sets: 4,
          reps: "8-10 reps",
          restSeconds: 90,
          muscle: "Pectoral medio",
          tip: "Retrae escápulas, baja en 3 segundos y empuja explosivo sin despegar el glúteo.",
        },
        "benchPress",
      ),
      noVid({
        id: "incline-db",
        name: "Press inclinado con mancuernas (30°)",
        sets: 3,
        reps: "10-12 reps",
        restSeconds: 75,
        muscle: "Pectoral superior",
        tip: "Banco a 30° (no más, o el hombro se lleva el trabajo). Alinea el codo a 45° del torso, baja hasta la altura del pecho y junta las mancuernas arriba sin chocarlas.",
      }),
      vid(
        {
          id: "ohp",
          name: "Press militar de pie o sentado",
          sets: 3,
          reps: "8-10 reps",
          restSeconds: 90,
          muscle: "Deltoides anterior",
          tip: "Aprieta abdomen y glúteos para no arquear la zona lumbar.",
        },
        "shoulderPress",
      ),
      noVid({
        id: "lateral-raises",
        name: "Elevaciones laterales estrictas",
        sets: 4,
        reps: "15-18 reps",
        restSeconds: 45,
        muscle: "Deltoides lateral",
        tip: "Guía el movimiento con los codos como si vaciaras dos jarras de agua a la altura del hombro. Sube solo hasta la línea del hombro, ni un grado más.",
      }),
      noVid({
        id: "triceps-pushdown",
        name: "Extensión de tríceps en cuerda",
        sets: 3,
        reps: "12-15 reps",
        restSeconds: 60,
        muscle: "Tríceps braquial",
        tip: "Codos pegados al costado y fijos. Abre la cuerda al final del recorrido y bloquea 1 segundo abajo.",
      }),
    ],
  },
  {
    id: "hiit-inferno",
    title: "HIIT Inferno · Quema Grasa 25 Min",
    subtitle: "Circuito metabólico de alta intensidad sin apenas material",
    category: "hiit",
    level: "Intermedio",
    durationMinutes: 25,
    caloriesBurned: 380,
    image: IMAGES.workoutHiit,
    accent: "from-cyan-400 to-blue-600",
    equipment: "Peso corporal / Kettlebell opcional",
    ...routineVideo("kettlebell"),
    exercises: [
      noVid({
        id: "burpee-broad",
        name: "Burpees con salto vertical",
        sets: 4,
        reps: "40 seg trabajo",
        restSeconds: 20,
        muscle: "Full Body + Cardio",
        tip: "Secuencia: cuclillas, manos al suelo, piernas atrás, flexión, piernas adelante y salto. Ritmo constante y aterriza suave con toda la planta del pie.",
      }),
      vid(
        {
          id: "kb-swing",
          name: "Kettlebell Swings",
          sets: 4,
          reps: "15-20 reps",
          restSeconds: 30,
          muscle: "Cadena posterior",
          tip: "El impulso nace del latigazo de cadera, no de tirar con los brazos. La pesa flota, no la levantas.",
        },
        "kettlebell",
      ),
      noVid({
        id: "mountain-climbers",
        name: "Mountain Climbers cruzados a máxima velocidad",
        sets: 4,
        reps: "45 seg trabajo",
        restSeconds: 20,
        muscle: "Core + Resistencia",
        tip: "Desde posición de plancha, lleva la rodilla al codo contrario alternando rápido. Hombros sobre las muñecas y cadera baja y estable.",
      }),
      vid(
        {
          id: "pushup-tempo",
          name: "Flexiones explosivas",
          sets: 3,
          reps: "12-15 reps",
          restSeconds: 45,
          muscle: "Pecho + Core",
          tip: "Cuerpo en bloque recto de talones a cabeza. Baja controlado y empuja con fuerza al subir.",
        },
        "pushup",
      ),
    ],
  },
  {
    id: "legs-glutes",
    title: "Pierna & Glúteo de Acero",
    subtitle: "Fuerza base de tren inferior, estabilidad de rodilla y potencia",
    category: "fuerza",
    level: "Avanzado",
    durationMinutes: 55,
    caloriesBurned: 490,
    image: IMAGES.hero,
    accent: "from-lime-400 to-emerald-600",
    equipment: "Barra, mancuernas y banco",
    ...routineVideo("squat"),
    exercises: [
      vid(
        {
          id: "squat",
          name: "Sentadilla profunda con barra",
          sets: 4,
          reps: "6-8 reps",
          restSeconds: 120,
          muscle: "Cuádriceps y Glúteo",
          tip: "Toma aire antes de bajar (maniobra de Valsalva) y empuja el suelo separando rodillas.",
        },
        "squat",
      ),
      vid(
        {
          id: "rdl",
          name: "Peso muerto rumano con barra",
          sets: 4,
          reps: "8-10 reps",
          restSeconds: 90,
          muscle: "Isquiotibiales y Glúteo",
          tip: "Lleva la cadera hacia atrás rozando los muslos con la barra hasta notar el estiramiento.",
        },
        "deadlift",
      ),
      vid(
        {
          id: "bulgarian",
          name: "Sentadilla búlgara con mancuernas",
          sets: 3,
          reps: "10 reps por pierna",
          restSeconds: 75,
          muscle: "Glúteo medio y Cuádriceps",
          tip: "Inclina ligeramente el torso hacia delante para enfatizar el glúteo. La rodilla trasera baja casi al suelo.",
        },
        "lunge",
      ),
      noVid({
        id: "hip-thrust",
        name: "Hip Thrust con pausa isométrica arriba",
        sets: 4,
        reps: "12 reps (2s pausa)",
        restSeconds: 75,
        muscle: "Glúteo mayor",
        tip: "Espalda alta apoyada en un banco, barra sobre la cadera. Sube hasta formar una línea recta hombro-cadera-rodilla, mirada al frente y barbilla recogida.",
      }),
    ],
  },
  {
    id: "pull-back-v",
    title: "Tirón & Espalda en V · Postura y Densidad",
    subtitle: "Dorsales anchos, espalda alta fuerte y bíceps rocosos",
    category: "hipertrofia",
    level: "Intermedio",
    durationMinutes: 45,
    caloriesBurned: 390,
    image: IMAGES.community,
    accent: "from-violet-500 to-cyan-400",
    equipment: "Barra de dominadas, polea y mancuernas",
    ...routineVideo("pullup"),
    exercises: [
      vid(
        {
          id: "pullups",
          name: "Dominadas pronas",
          sets: 4,
          reps: "8-10 reps",
          restSeconds: 90,
          muscle: "Dorsal ancho",
          tip: "Inicia el tirón deprimiendo los hombros y lleva los codos hacia tus bolsillos.",
        },
        "pullup",
      ),
      noVid({
        id: "row-db",
        name: "Remo con mancuerna a una mano",
        sets: 4,
        reps: "10-12 reps",
        restSeconds: 75,
        muscle: "Espalda media y Dorsal",
        tip: "Apoya rodilla y mano en el banco, espalda plana y paralela al suelo. Tracciona hacia la cadera (no hacia el hombro) y aprieta la escápula arriba.",
      }),
      noVid({
        id: "face-pull",
        name: "Face Pulls en polea alta",
        sets: 3,
        reps: "15-20 reps",
        restSeconds: 45,
        muscle: "Deltoides posterior y Manguito",
        tip: "Cuerda a la altura de la cara. Tira separando las manos hacia las orejas y rota externamente los hombros formando un doble bíceps.",
      }),
      vid(
        {
          id: "incline-curl",
          name: "Curl de bíceps con mancuernas",
          sets: 3,
          reps: "10-12 reps",
          restSeconds: 60,
          muscle: "Bíceps cabeza larga",
          tip: "Mantén el codo fijo y pegado al torso. Sin balanceo: si la espalda se mueve, baja el peso.",
        },
        "curl",
      ),
    ],
  },
  {
    id: "core-mobility",
    title: "Core Blindado & Movilidad Consciente",
    subtitle: "Abdomen funcional, estabilidad lumbar y descompresión articular",
    category: "core",
    level: "Principiante",
    durationMinutes: 20,
    caloriesBurned: 210,
    image: IMAGES.mind,
    accent: "from-amber-400 to-rose-500",
    equipment: "Esterilla",
    ...routineVideo("plank"),
    exercises: [
      noVid({
        id: "dead-bug",
        name: "Dead Bug controlado con respiración",
        sets: 3,
        reps: "12 reps alternas",
        restSeconds: 30,
        muscle: "Transverso abdominal",
        tip: "Boca arriba, brazos y rodillas a 90°. Estira brazo y pierna contrarios sin que la lumbar se despegue del suelo. Exhala todo el aire al estirar.",
      }),
      vid(
        {
          id: "plank-saw",
          name: "Plancha frontal isométrica",
          sets: 3,
          reps: "40 seg tensión máxima",
          restSeconds: 30,
          muscle: "Core completo",
          tip: "Codos bajo los hombros, cuerpo en línea recta. Aprieta glúteos y abdomen como si fueras a recibir un puñetazo.",
        },
        "plank",
      ),
      vid(
        {
          id: "hollow-hold",
          name: "Elevaciones de piernas tumbado",
          sets: 3,
          reps: "12 reps",
          restSeconds: 40,
          muscle: "Recto abdominal inferior",
          tip: "Lumbar pegada al suelo durante todo el recorrido. Si se despega, flexiona ligeramente las rodillas.",
        },
        "crunchAlt",
      ),
      noVid({
        id: "thoracic-flow",
        name: "Aperturas torácicas + World's Greatest Stretch",
        sets: 2,
        reps: "8 por lado",
        restSeconds: 20,
        muscle: "Movilidad de cadera y columna",
        tip: "Desde zancada profunda, apoya el codo junto al pie adelantado y abre el brazo contrario hacia el techo girando el torso. Respira profundo en el punto de mayor estiramiento.",
      }),
    ],
  },

  {
    id: "full-body-express",
    title: "Full Body Express · 30 Minutos Sin Excusas",
    subtitle: "Cuerpo completo en media hora: ideal para días con poco tiempo",
    category: "fuerza",
    level: "Principiante",
    durationMinutes: 30,
    caloriesBurned: 300,
    image: ROUTINE_PHOTOS.bench,
    accent: "from-cyan-400 to-emerald-500",
    equipment: "Un par de mancuernas",
    ...routineVideo("squat"),
    exercises: [
      vid(
        {
          id: "fbe-goblet",
          name: "Goblet Squat con mancuerna al pecho",
          sets: 3,
          reps: "12 reps",
          restSeconds: 60,
          muscle: "Piernas completas",
          tip: "Sujeta la mancuerna pegada al esternón, codos dentro y baja hasta que los muslos queden paralelos al suelo.",
        },
        "squat",
      ),
      vid(
        {
          id: "fbe-pushup",
          name: "Flexiones (rodillas apoyadas si hace falta)",
          sets: 3,
          reps: "10-15 reps",
          restSeconds: 60,
          muscle: "Pecho y Tríceps",
          tip: "Manos ligeramente más anchas que los hombros; baja hasta rozar el pecho sin hundir la cadera.",
        },
        "pushupAlt",
      ),
      noVid({
        id: "fbe-row",
        name: "Remo inclinado con mancuernas",
        sets: 3,
        reps: "12 reps",
        restSeconds: 60,
        muscle: "Espalda completa",
        tip: "Inclina el torso 45° con la espalda plana y las rodillas algo flexionadas. Lleva las mancuernas hacia la cadera apretando escápulas al final.",
      }),
      vid(
        {
          id: "fbe-press",
          name: "Press de hombro de pie",
          sets: 3,
          reps: "10 reps",
          restSeconds: 60,
          muscle: "Hombros",
          tip: "Abdomen firme para no arquear la espalda; sube hasta estirar los codos sin bloquear de golpe.",
        },
        "shoulderPress",
      ),
      vid(
        {
          id: "fbe-plank",
          name: "Plancha frontal",
          sets: 3,
          reps: "30-45 seg",
          restSeconds: 45,
          muscle: "Core",
          tip: "Línea recta de talones a cabeza; aprieta glúteos y lleva el ombligo hacia dentro.",
        },
        "plankAlt",
      ),
    ],
  },
  {
    id: "upper-body-power",
    title: "Tren Superior Potente · Pecho, Espalda y Brazos",
    subtitle: "Sesión completa de empuje y tirón para hombros anchos y brazos densos",
    category: "hipertrofia",
    level: "Avanzado",
    durationMinutes: 60,
    caloriesBurned: 470,
    image: ROUTINE_PHOTOS.pullup,
    accent: "from-fuchsia-500 to-cyan-400",
    equipment: "Barra de dominadas, mancuernas y banco",
    ...routineVideo("pullupOutdoor"),
    exercises: [
      vid(
        {
          id: "ubp-pullup",
          name: "Dominadas lastradas o asistidas",
          sets: 4,
          reps: "6-8 reps",
          restSeconds: 120,
          muscle: "Dorsal ancho",
          tip: "Cuelga con los brazos estirados, activa el dorsal antes de tirar y sube hasta pasar la barbilla.",
        },
        "pullupOutdoor",
      ),
      vid(
        {
          id: "ubp-bench",
          name: "Press de banca plano",
          sets: 4,
          reps: "6-8 reps",
          restSeconds: 120,
          muscle: "Pectoral",
          tip: "Cinco puntos de apoyo: pies, glúteo, espalda alta y cabeza. Barra a la altura del pezón.",
        },
        "benchPress",
      ),
      noVid({
        id: "ubp-row",
        name: "Remo Pendlay con barra",
        sets: 4,
        reps: "8 reps",
        restSeconds: 90,
        muscle: "Espalda media",
        tip: "Torso paralelo al suelo. Cada repetición arranca desde el suelo: explosivo al subir la barra al abdomen, controlado al bajar.",
      }),
      noVid({
        id: "ubp-dip",
        name: "Fondos en paralelas o banco",
        sets: 3,
        reps: "10-12 reps",
        restSeconds: 75,
        muscle: "Tríceps y Pecho inferior",
        tip: "Torso ligeramente inclinado para enfatizar pecho, vertical para tríceps. Baja hasta 90° de codo sin encoger los hombros.",
      }),
      vid(
        {
          id: "ubp-curl",
          name: "Curl martillo + Curl supino (superserie)",
          sets: 3,
          reps: "10 + 10 reps",
          restSeconds: 60,
          muscle: "Bíceps y Braquial",
          tip: "Sin balanceo: si la espalda se mueve, baja el peso. La tensión debe vivir en el bíceps.",
        },
        "curl",
      ),
    ],
  },
  {
    id: "tabata-shred",
    title: "Tabata Shred · 4 Bloques de Fuego",
    subtitle: "20 segundos a tope, 10 de descanso. El protocolo más eficiente que existe",
    category: "hiit",
    level: "Avanzado",
    durationMinutes: 18,
    caloriesBurned: 320,
    image: ROUTINE_PHOTOS.jumpRope,
    accent: "from-rose-500 to-amber-400",
    equipment: "Peso corporal y comba",
    ...routineVideo("jumpRope"),
    exercises: [
      vid(
        {
          id: "tab-rope",
          name: "Comba a ritmo alto",
          sets: 8,
          reps: "20 seg máx / 10 seg off",
          restSeconds: 10,
          muscle: "Cardio y Gemelos",
          tip: "Muñecas sueltas, codos pegados al cuerpo y salto mínimo: eficiencia antes que altura.",
        },
        "jumpRope",
      ),
      noVid({
        id: "tab-squat-jump",
        name: "Sentadilla con salto",
        sets: 8,
        reps: "20 seg máx / 10 seg off",
        restSeconds: 10,
        muscle: "Piernas explosivas",
        tip: "Baja a sentadilla con el peso en los talones y sube explotando hacia arriba. Aterriza con rodillas flexionadas y pie completo para amortiguar el impacto.",
      }),
      vid(
        {
          id: "tab-pushup",
          name: "Flexiones a ritmo máximo",
          sets: 8,
          reps: "20 seg máx / 10 seg off",
          restSeconds: 10,
          muscle: "Pecho y Core",
          tip: "Si pierdes la línea recta del cuerpo, apoya las rodillas y sigue sin parar.",
        },
        "pushup",
      ),
      noVid({
        id: "tab-mountain",
        name: "Mountain Climbers",
        sets: 8,
        reps: "20 seg máx / 10 seg off",
        restSeconds: 10,
        muscle: "Core y Cardio",
        tip: "Desde plancha alta, alterna rodillas hacia el pecho a máxima velocidad. Cadera baja y estable: no dejes que suba y baje como un acordeón.",
      }),
    ],
  },
  {
    id: "six-pack-sculpt",
    title: "Six-Pack Sculpt · Abdomen Definido",
    subtitle: "Trabajo completo de recto, oblicuos y transverso en 15 minutos",
    category: "core",
    level: "Intermedio",
    durationMinutes: 15,
    caloriesBurned: 170,
    image: ROUTINE_PHOTOS.abs,
    accent: "from-violet-500 to-fuchsia-500",
    equipment: "Solo esterilla",
    ...routineVideo("crunch"),
    exercises: [
      vid(
        {
          id: "sp-crunch",
          name: "Crunch abdominal",
          sets: 4,
          reps: "20 reps",
          restSeconds: 30,
          muscle: "Recto abdominal superior",
          tip: "No tires del cuello: manos en las sienes y sube despegando solo las escápulas del suelo.",
        },
        "crunch",
      ),
      vid(
        {
          id: "sp-leg-raise",
          name: "Elevaciones de piernas tumbado",
          sets: 4,
          reps: "15 reps",
          restSeconds: 30,
          muscle: "Recto abdominal inferior",
          tip: "Manos bajo los glúteos y lumbar pegada al suelo durante todo el recorrido.",
        },
        "crunchAlt",
      ),
      noVid({
        id: "sp-russian",
        name: "Russian Twist con peso",
        sets: 3,
        reps: "20 toques alternos",
        restSeconds: 30,
        muscle: "Oblicuos",
        tip: "Sentado con el torso inclinado atrás y pies elevados. Gira desde el torso llevando el peso de lado a lado, no solo con los brazos.",
      }),
      noVid({
        id: "sp-side-plank",
        name: "Plancha lateral",
        sets: 3,
        reps: "40 seg por lado",
        restSeconds: 30,
        muscle: "Oblicuos y estabilizadores",
        tip: "Tumbado de lado, codo justo debajo del hombro y pies apilados. Eleva la cadera hasta formar una línea recta tobillo-cadera-hombro y aprieta el oblicuo de abajo para no dejarla caer.",
      }),
    ],
  },
  {
    id: "mobility-recovery",
    title: "Movilidad & Recuperación Activa",
    subtitle: "Para días de descanso: descomprime la espalda y recupera rango articular",
    category: "core",
    level: "Principiante",
    durationMinutes: 22,
    caloriesBurned: 120,
    image: IMAGES.mind,
    accent: "from-emerald-400 to-cyan-400",
    equipment: "Esterilla y rodillo opcional",
    exercises: [
      noVid({
        id: "mr-catcow",
        name: "Gato-Camello (movilidad de columna)",
        sets: 3,
        reps: "12 ciclos lentos",
        restSeconds: 20,
        muscle: "Columna completa",
        tip: "A cuatro patas, alterna arquear y redondear la espalda vértebra a vértebra. Inhala al arquear, exhala al redondear.",
      }),
      noVid({
        id: "mr-hip",
        name: "Estiramiento de flexor de cadera en zancada",
        sets: 3,
        reps: "40 seg por lado",
        restSeconds: 15,
        muscle: "Psoas y Flexores",
        tip: "Rodilla trasera en el suelo. Mete la pelvis hacia dentro (retroversión) antes de empujar la cadera hacia delante.",
      }),
      noVid({
        id: "mr-thoracic",
        name: "Rotación torácica tumbado de lado",
        sets: 2,
        reps: "10 por lado",
        restSeconds: 20,
        muscle: "Espalda alta",
        tip: "Tumbado de lado con rodillas juntas fijas en el suelo, abre el brazo de arriba hacia el lado contrario siguiendo la mano con la mirada.",
      }),
      noVid({
        id: "mr-breathing",
        name: "Respiración diafragmática 4-7-8",
        sets: 2,
        reps: "8 ciclos",
        restSeconds: 20,
        muscle: "Sistema nervioso",
        tip: "Inhala 4 seg por la nariz llevando el aire al abdomen, retén 7 y exhala 8 por la boca. Baja pulsaciones al instante.",
      }),
    ],
  },
];

export const FITNESS_RECIPES: FitnessRecipe[] = [
  {
    id: "salmon-teriyaki-bowl",
    title: "Poke Bowl de Salmón Glaseado, Quinoa y Edamame",
    subtitle: "Alto en Omega-3, proteína limpia y carbohidratos de absorción lenta",
    category: "proteina",
    categoryLabel: "Aumento Muscular",
    prepMinutes: 18,
    calories: 560,
    protein: 44,
    carbs: 48,
    fats: 21,
    image: IMAGES.recipeProtein,
    accent: "from-fuchsia-500 to-cyan-400",
    ingredients: [
      "180g de lomo de salmón fresco",
      "120g de quinoa cocida al vapor",
      "60g de edamames pelados al vapor",
      "1/2 aguacate laminado en abanico",
      "1 cucharada de salsa tamari baja en sodio + jengibre rallado",
      "Semillas de sésamo tostado y cebollino picado",
    ],
    steps: [
      "Marina el salmón 5 minutos con salsa tamari, jengibre fresco rallado y unas gotas de lima.",
      "Dora el salmón en sartén antiadherente o airfryer a 200°C durante 7-8 minutos hasta que quede jugoso por dentro y caramelizado por fuera.",
      "Sirve una base templada de quinoa y coloca encima los edamames, el aguacate laminado y el salmón.",
      "Termina con semillas de sésamo y cebollino fresco. ¡Listo para recuperar tus músculos!",
    ],
  },
  {
    id: "acai-protein-bowl",
    title: "Smoothie Bowl Proteico de Açaí, Frutos Rojos y Crema de Cacahuete",
    subtitle: "Bomba antioxidante pre o post-entreno lista en 5 minutos",
    category: "post-entreno",
    categoryLabel: "Post-Entreno",
    prepMinutes: 7,
    calories: 440,
    protein: 36,
    carbs: 46,
    fats: 12,
    image: IMAGES.recipeBowl,
    accent: "from-violet-500 to-lime-400",
    ingredients: [
      "1 cazo (30g) de proteína Whey o vegetal sabor vainilla/chocolate",
      "100g de pulpa de açaí o frutos del bosque congelados",
      "1 plátano maduro congelado en rodajas",
      "100ml de bebida de almendras sin azúcar o yogur griego alto en proteína",
      "15g de crema de cacahuete 100% natural",
      "Toppings: arándanos frescos, semillas de chía y 20g de avena crujiente",
    ],
    steps: [
      "Tritura en batidora potente el açaí congelado, medio plátano, la proteína en polvo y la bebida vegetal hasta lograr textura de helado cremoso.",
      "Vierte en un bol frío y decora en líneas con las rodajas de plátano restante, los arándanos y las semillas de chía.",
      "Añade un hilo de crema de cacahuete natural por encima para aportar grasas saludables y saciedad.",
    ],
  },
  {
    id: "mediterranean-power-bowl",
    title: "Power Bowl Verde de Pollo Crujiente, Aguacate y Hummus",
    subtitle: "Alta saciedad y densidad nutricional para definición sin pasar hambre",
    category: "definicion",
    categoryLabel: "Definición / Quema Grasa",
    prepMinutes: 15,
    calories: 430,
    protein: 48,
    carbs: 26,
    fats: 14,
    image: IMAGES.nutrition,
    accent: "from-lime-400 to-emerald-500",
    ingredients: [
      "200g de pechuga de pollo de corral en tiras con pimentón ahumado y ajo",
      "2 puñados de brotes de espinaca baby y rúcula",
      "1/2 aguacate maduro en dados",
      "40g de hummus clásico de garbanzo",
      "Tomates cherry asados y pepino laminado",
      "1 cucharadita de aceite de oliva virgen extra y zumo de limón",
    ],
    steps: [
      "Sazona las tiras de pollo con pimentón ahumado, ajo en polvo, orégano y sal marina.",
      "Cocina a fuego vivo en sartén de hierro durante 4 minutos por lado hasta dorar.",
      "Monta el bol con la base verde, tomates cherry, pepino, aguacate y una cucharada generosa de hummus en el centro.",
      "Coloca el pollo caliente encima y aliña con limón recién exprimido.",
    ],
  },
  {
    id: "oat-pancakes-anabolic",
    title: "Tortitas Fitness de Avena, Claras y Plátano con Cacao Puro",
    subtitle: "Desayuno energético de campeones para entrenar al 100%",
    category: "energia",
    categoryLabel: "Energía Sostenida",
    prepMinutes: 10,
    calories: 410,
    protein: 34,
    carbs: 52,
    fats: 7,
    image: RECIPE_PHOTOS.proteinPancakes,
    accent: "from-amber-400 to-rose-500",
    ingredients: [
      "60g de harina de avena o copos de avena molidos",
      "150ml de claras de huevo + 1 huevo entero",
      "1 plátano maduro",
      "1 cucharadita de canela de Ceilán y levadura en polvo",
      "1 cucharada de cacao puro desgrasado",
      "Frutos rojos frescos para acompañar",
    ],
    steps: [
      "Bate la avena, las claras, el huevo entero, medio plátano y la canela hasta obtener una masa homogénea.",
      "Vierte porciones en una sartén caliente a fuego medio y da la vuelta cuando salgan burbujas en la superficie (1-2 min por lado).",
      "Mezcla el cacao puro con dos cucharadas de agua templada para crear un sirope intenso sin azúcar y sírvelo con los frutos rojos.",
    ],
  },
  {
    id: "chicken-teriyaki-rice",
    title: "Pollo Teriyaki Casero con Arroz y Brócoli",
    subtitle: "El clásico meal-prep: cocina una vez, come tres días",
    category: "proteina",
    categoryLabel: "Aumento Muscular",
    prepMinutes: 25,
    calories: 620,
    protein: 52,
    carbs: 62,
    fats: 14,
    image: RECIPE_PHOTOS.chickenRice,
    accent: "from-amber-400 to-orange-500",
    ingredients: [
      "250g de pechuga de pollo en tiras",
      "150g de arroz basmati o integral cocido",
      "150g de brócoli en floretes al vapor",
      "2 cucharadas de salsa de soja baja en sal",
      "1 cucharadita de miel + 1 diente de ajo picado + jengibre rallado",
      "Semillas de sésamo y cebolleta fresca",
    ],
    steps: [
      "Mezcla la soja, la miel, el ajo y el jengibre en un bol: esa es tu salsa teriyaki casera sin azúcares añadidos.",
      "Sella el pollo en una sartén muy caliente 3-4 minutos por lado hasta que se dore bien por fuera.",
      "Baja el fuego, añade la salsa y deja reducir 2 minutos hasta que se vuelva brillante y cubra el pollo.",
      "Sirve sobre el arroz con el brócoli al vapor al lado y espolvorea sésamo y cebolleta picada.",
    ],
  },
  {
    id: "salmon-couscous",
    title: "Salmón al Horno con Cuscús de Verduras",
    subtitle: "Cena ligera rica en Omega-3 lista en una sola bandeja",
    category: "proteina",
    categoryLabel: "Aumento Muscular",
    prepMinutes: 22,
    calories: 540,
    protein: 42,
    carbs: 44,
    fats: 20,
    image: RECIPE_PHOTOS.salmonCouscous,
    accent: "from-rose-400 to-amber-400",
    ingredients: [
      "180g de lomo de salmón con piel",
      "80g de cuscús integral seco",
      "1 calabacín y 1 pimiento rojo en dados",
      "Zumo de medio limón y ralladura",
      "1 cucharada de aceite de oliva virgen extra",
      "Eneldo fresco, sal y pimienta negra",
    ],
    steps: [
      "Precalienta el horno a 200°C. Coloca el salmón con la piel hacia abajo sobre papel de hornear.",
      "Reparte alrededor el calabacín y el pimiento en dados, riega todo con aceite, limón, sal y pimienta.",
      "Hornea 12-14 minutos: el salmón debe quedar rosado en el centro, nunca seco.",
      "Hidrata el cuscús con el mismo volumen de agua hirviendo y tápalo 5 minutos; suéltalo con un tenedor.",
      "Mezcla el cuscús con las verduras asadas y sirve el salmón encima con eneldo fresco.",
    ],
  },
  {
    id: "quinoa-power-salad",
    title: "Ensalada Power de Quinoa, Pollo y Semillas",
    subtitle: "Fría, se transporta perfecto y aguanta todo el día en el tupper",
    category: "definicion",
    categoryLabel: "Definición / Quema Grasa",
    prepMinutes: 20,
    calories: 470,
    protein: 40,
    carbs: 38,
    fats: 16,
    image: RECIPE_PHOTOS.quinoaSalad,
    accent: "from-lime-400 to-cyan-400",
    ingredients: [
      "180g de pollo a la plancha en dados",
      "100g de quinoa cocida y fría",
      "Tomate cherry, pepino y zanahoria rallada",
      "30g de mezcla de semillas (calabaza, girasol, lino)",
      "Hojas de espinaca baby y perejil",
      "Vinagreta: aceite de oliva, mostaza de Dijon, limón y una pizca de sal",
    ],
    steps: [
      "Cuece la quinoa 12 minutos, escúrrela y enfríala bajo el grifo para que quede suelta.",
      "Corta el pollo ya cocinado en dados y trocea todas las verduras en tamaños similares.",
      "Bate la vinagreta en un bote cerrado agitando fuerte hasta que emulsione.",
      "Mezcla todo en un bol grande, añade las semillas al final para que no pierdan el crujiente.",
    ],
  },
  {
    id: "avocado-eggs-toast",
    title: "Tostada de Aguacate con Huevos Poché",
    subtitle: "Desayuno saciante en 10 minutos con grasas buenas y proteína completa",
    category: "energia",
    categoryLabel: "Energía Sostenida",
    prepMinutes: 10,
    calories: 420,
    protein: 24,
    carbs: 34,
    fats: 22,
    image: RECIPE_PHOTOS.eggsAvocado,
    accent: "from-emerald-400 to-lime-400",
    ingredients: [
      "2 rebanadas de pan integral de masa madre",
      "1 aguacate maduro",
      "2 huevos camperos",
      "1 cucharadita de vinagre blanco (para el poché)",
      "Zumo de limón, sal en escamas, pimienta y copos de chile",
      "Rúcula o brotes tiernos",
    ],
    steps: [
      "Calienta agua en un cazo sin que llegue a hervir del todo y añade el vinagre.",
      "Cuaja los huevos poché: crea un remolino con una cuchara, deja caer el huevo en el centro y cocina 3 minutos.",
      "Machaca el aguacate con limón, sal y pimienta hasta obtener una crema con grumos.",
      "Tuesta el pan, extiende el aguacate, coloca el huevo encima y termina con chile en copos y brotes.",
    ],
  },
  {
    id: "greek-yogurt-parfait",
    title: "Parfait de Yogur Griego, Granola y Frutos Rojos",
    subtitle: "Snack o postre alto en proteína que sabe a capricho",
    category: "post-entreno",
    categoryLabel: "Post-Entreno",
    prepMinutes: 5,
    calories: 340,
    protein: 30,
    carbs: 36,
    fats: 8,
    image: RECIPE_PHOTOS.granolaParfait,
    accent: "from-violet-500 to-rose-400",
    ingredients: [
      "250g de yogur griego natural 0% o skyr",
      "40g de granola sin azúcares añadidos",
      "100g de frutos rojos frescos o congelados",
      "1 cucharadita de miel cruda o sirope de agave (opcional)",
      "Semillas de chía y ralladura de limón",
    ],
    steps: [
      "En un vaso alto, pon una primera capa generosa de yogur griego.",
      "Añade una capa de frutos rojos y espolvorea la mitad de la granola.",
      "Repite las capas hasta llenar el vaso y termina con granola por encima para que quede crujiente.",
      "Riega con un hilo de miel y ralla limón justo antes de comer para potenciar el aroma.",
    ],
  },
  {
    id: "overnight-oats-protein",
    title: "Overnight Oats Proteicos de Plátano y Canela",
    subtitle: "Se prepara en 3 minutos por la noche y te espera listo por la mañana",
    category: "energia",
    categoryLabel: "Energía Sostenida",
    prepMinutes: 5,
    calories: 450,
    protein: 32,
    carbs: 58,
    fats: 10,
    image: RECIPE_PHOTOS.oatmeal,
    accent: "from-amber-400 to-lime-400",
    ingredients: [
      "60g de copos de avena integral",
      "1 cazo (30g) de proteína en polvo sabor vainilla",
      "200ml de leche o bebida vegetal sin azúcar",
      "1 plátano maduro machacado",
      "1 cucharadita de canela y 1 de semillas de chía",
      "Toppings: nueces troceadas y arándanos",
    ],
    steps: [
      "En un tarro de cristal, mezcla la avena, la proteína en polvo, la canela y las semillas de chía.",
      "Añade la leche poco a poco removiendo para que no queden grumos de proteína.",
      "Incorpora el plátano machacado, cierra el tarro y deja reposar en la nevera mínimo 6 horas.",
      "Por la mañana remueve, añade las nueces y los arándanos por encima y listo para llevar.",
    ],
  },
];

export function buildWelcomeEmail(params: {
  name: string;
  email: string;
  goal: string;
  code: string;
}): { subject: string; body: string } {
  const firstName = params.name.split(" ")[0] || params.name;
  return {
    subject: `🔥 ¡Bienvenido a VITALIS, ${firstName}! Tu cuenta y Plan Fitness están activos (Código #${params.code})`,
    body: `Hola ${firstName} (${params.email}),

¡Tu registro en VITALIS se ha completado y verificado automáticamente!
Código de activación de atleta: ${params.code} (Estado: VERIFICADO ✅)

🎯 Tu objetivo registrado:
"${params.goal}"

Hemos preparado y desbloqueado en tu página de inicio todas tus herramientas interactivas para que empieces hoy mismo:

1. ✅ HABIT TRACKER DIARIO: Ya tienes tus hábitos clave creados. Marca tu primer check hoy para encender tu racha y ganar tus primeros +10 XP.
2. 🏋️ RUTINAS FITNESS INTERACTIVAS: 10 rutinas con cronómetro de descanso, seguimiento serie por serie y vídeo de técnica en los ejercicios principales. Al terminar sumarás +50 XP.
3. 🥗 RECETAS FITNESS CON MACROS: 10 platos altos en proteína con ingredientes y pasos interactivos que puedes marcar mientras cocinas (+15 XP al registrar comida limpia).
4. 💬 FRASES & MINDSET: Más de 60 frases para los días en que cueste levantarse, y puedes añadir las tuyas.

Recuerda: no necesitas motivación todos los días, necesitas un sistema. Hoy es tu Día 1.

— El equipo de VITALIS Coach`,
  };
}
