/**
 * Biblioteca de medios demostrativos para ejercicios y fotografía de platos.
 */

export type DemoMedia = {
  video: string;
  poster: string;
  credit: string;
};

export const EXERCISE_MEDIA = {
  /** Sentadilla con barra — vista lateral */
  squat: {
    video: "https://videos.pexels.com/video-files/5319759/5319759-uhd_3840_2160_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/5319759/pexels-photo-5319759.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "Tima Miroshnichenko · Pexels",
  },
  /** Press de banca */
  benchPress: {
    video: "https://videos.pexels.com/video-files/5320007/5320007-uhd_3840_2160_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/5320007/pexels-photo-5320007.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "Tima Miroshnichenko · Pexels",
  },
  /** Press de banca — segunda toma */
  benchPressAlt: {
    video: "https://videos.pexels.com/video-files/37075062/15706549_3840_2160_24fps.mp4",
    poster:
      "https://images.pexels.com/videos/37075062/pexels-photo-37075062.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "Ray Sanchez · Pexels",
  },
  /** Peso muerto con barra */
  deadlift: {
    video: "https://videos.pexels.com/video-files/14180867/14180867-uhd_4096_2048_24fps.mp4",
    poster:
      "https://images.pexels.com/videos/14180867/back-workout-deadlift-exercise-fitness-and-health-14180867.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "Navdeep Singh · Pexels",
  },
  /** Zancada / sentadilla búlgara */
  lunge: {
    video: "https://videos.pexels.com/video-files/31035743/13265211_1920_1080_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/31035743/body-fitness-girl-sport-31035743.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "Aliaksei Masiukevich · Pexels",
  },
  /** Flexiones */
  pushup: {
    video: "https://videos.pexels.com/video-files/6388436/6388436-uhd_3840_2160_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/6388436/pexels-photo-6388436.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "Tima Miroshnichenko · Pexels",
  },
  /** Flexiones — segunda toma */
  pushupAlt: {
    video: "https://videos.pexels.com/video-files/6970183/6970183-hd_1920_1080_30fps.mp4",
    poster:
      "https://images.pexels.com/videos/6970183/pexels-photo-6970183.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "Mikhail Nilov · Pexels",
  },
  /** Dominadas en barra */
  pullup: {
    video: "https://videos.pexels.com/video-files/15859716/15859716-uhd_3840_2160_30fps.mp4",
    poster:
      "https://images.pexels.com/videos/15859716/gym-gym-and-fitness-gym-workout-pull-up-bar-15859716.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "Sport O'Scope · Pexels",
  },
  /** Dominadas al aire libre */
  pullupOutdoor: {
    video: "https://videos.pexels.com/video-files/31622700/13475096_3840_2160_60fps.mp4",
    poster:
      "https://images.pexels.com/videos/31622700/abs-athlete-athletic-back-muscles-31622700.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "Logan Voss · Pexels",
  },
  /** Press de hombro con mancuernas */
  shoulderPress: {
    video: "https://videos.pexels.com/video-files/4367541/4367541-hd_1920_1080_30fps.mp4",
    poster:
      "https://images.pexels.com/videos/4367541/barbell-dumbbells-exercise-bike-fitness-equipment-4367541.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "Pavel Danilyuk · Pexels",
  },
  /** Curl de bíceps con mancuernas */
  curl: {
    video: "https://videos.pexels.com/video-files/15528204/15528204-hd_1920_1080_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/15528204/aesthetic-anatomy-arms-athlete-15528204.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "Markofit Production · Pexels",
  },
  /** Swing con kettlebell */
  kettlebell: {
    video: "https://videos.pexels.com/video-files/8780727/8780727-hd_1920_1080_30fps.mp4",
    poster:
      "https://images.pexels.com/videos/8780727/athletic-cavemantraining-crossfit-crossfit-training-8780727.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "Taco Fleur · Pexels",
  },
  /** Comba / salto a la cuerda */
  jumpRope: {
    video: "https://videos.pexels.com/video-files/9943727/9943727-uhd_3840_2160_24fps.mp4",
    poster:
      "https://images.pexels.com/videos/9943727/pexels-photo-9943727.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "KoolShooters · Pexels",
  },
  /** Crunch abdominal en suelo */
  crunch: {
    video: "https://videos.pexels.com/video-files/8233062/8233062-uhd_4096_2160_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/8233062/pexels-photo-8233062.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "ROMAN ODINTSOV · Pexels",
  },
  /** Abdominal en suelo — segunda toma */
  crunchAlt: {
    video: "https://videos.pexels.com/video-files/8233050/8233050-uhd_4096_2160_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/8233050/pexels-photo-8233050.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "ROMAN ODINTSOV · Pexels",
  },
  /** Plancha isométrica sobre esterilla */
  plank: {
    video: "https://videos.pexels.com/video-files/7801720/7801720-uhd_4096_1728_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/7801720/pexels-photo-7801720.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "Pavel Danilyuk · Pexels",
  },
  /** Plancha — segunda toma */
  plankAlt: {
    video: "https://videos.pexels.com/video-files/6286164/6286164-uhd_3840_2160_30fps.mp4",
    poster:
      "https://images.pexels.com/videos/6286164/pexels-photo-6286164.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    credit: "Gustavo Fring · Pexels",
  },
} as const satisfies Record<string, DemoMedia>;

export type ExerciseMediaKey = keyof typeof EXERCISE_MEDIA;

/* ------------------------------------------------------------------ */
/* Fotografías de platos                                               */
/* ------------------------------------------------------------------ */

export const RECIPE_PHOTOS = {
  salmonPoke:
    "https://images.pexels.com/photos/15913462/pexels-photo-15913462.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  salmonCouscous:
    "https://images.pexels.com/photos/38080217/pexels-photo-38080217.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  chickenRice:
    "https://images.pexels.com/photos/5305441/pexels-photo-5305441.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  quinoaSalad:
    "https://images.pexels.com/photos/2741448/pexels-photo-2741448.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  eggsAvocado:
    "https://images.pexels.com/photos/15366691/pexels-photo-15366691.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  oatmeal:
    "https://images.pexels.com/photos/7535151/pexels-photo-7535151.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  proteinPancakes:
    "https://images.pexels.com/photos/6947256/pexels-photo-6947256.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  granolaParfait:
    "https://images.pexels.com/photos/13689794/pexels-photo-13689794.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
} as const;

/* ------------------------------------------------------------------ */
/* Imágenes de portada para rutinas                                    */
/* ------------------------------------------------------------------ */

export const ROUTINE_PHOTOS = {
  squat: EXERCISE_MEDIA.squat.poster,
  pullup: EXERCISE_MEDIA.pullupOutdoor.poster,
  jumpRope: EXERCISE_MEDIA.jumpRope.poster,
  abs: EXERCISE_MEDIA.crunch.poster,
  bench: EXERCISE_MEDIA.benchPress.poster,
  plank: EXERCISE_MEDIA.plank.poster,
} as const;
