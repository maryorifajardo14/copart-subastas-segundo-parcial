// Fotografías reales de los vehículos del seed, tomadas de Wikimedia Commons
// (licencias libres CC BY / CC BY-SA). Cada lista corresponde a la marca, modelo,
// generación y año del vehículo publicado.

const FOTOS_VEHICULOS = {
  // Toyota Corolla 2019 (E170, facelift Norteamérica 2017-2019)
  corolla: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/2019_Toyota_Corolla_%28facelift%29%2C_front_3.24.23.jpg/960px-2019_Toyota_Corolla_%28facelift%29%2C_front_3.24.23.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2018_Toyota_Corolla_LE_%28facelift%29%2C_rear_3.31.23.jpg/960px-2018_Toyota_Corolla_LE_%28facelift%29%2C_rear_3.31.23.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2018_Toyota_Corolla_SE_50th_Anniversary_Edition_front_5.20.18.jpg/960px-2018_Toyota_Corolla_SE_50th_Anniversary_Edition_front_5.20.18.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2018_Toyota_Corolla%2C_Front_Right%2C_01-08-2021.jpg/960px-2018_Toyota_Corolla%2C_Front_Right%2C_01-08-2021.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/2017_Toyota_Corolla_SE_50th_Anniversary_Edition_rear_5.20.18.jpg/960px-2017_Toyota_Corolla_SE_50th_Anniversary_Edition_rear_5.20.18.jpg',
  ],
  // Ford F-150 2021 (14.ª generación)
  f150: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/2021_Ford_F-150_SuperCrew%2C_front_4.28.21.jpg/960px-2021_Ford_F-150_SuperCrew%2C_front_4.28.21.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/2021_Ford_F-150_SuperCrew%2C_rear_4.28.21.jpg/960px-2021_Ford_F-150_SuperCrew%2C_rear_4.28.21.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/2021_Ford_F150_Supercrew%2C_Front_Right%2C_03-09-2021.jpg/960px-2021_Ford_F150_Supercrew%2C_Front_Right%2C_03-09-2021.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2021_Ford_F-150_Lariat.jpg/960px-2021_Ford_F-150_Lariat.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/%2721_Ford_F-150_XLT_Crew_Cab.jpg/960px-%2721_Ford_F-150_XLT_Crew_Cab.jpg',
  ],
  // Honda CR-V 2017 (5.ª generación)
  crv: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/2017_Honda_CR-V_front_4.11.18.jpg/960px-2017_Honda_CR-V_front_4.11.18.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/2017_Honda_CR-V_rear_4.11.18.jpg/960px-2017_Honda_CR-V_rear_4.11.18.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/2017_Honda_CR-V_EX%2C_Front_Right%2C_04-04-2021.jpg/960px-2017_Honda_CR-V_EX%2C_Front_Right%2C_04-04-2021.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/2017_Honda_CR-V_AWD%2C_12.28.19.jpg/960px-2017_Honda_CR-V_AWD%2C_12.28.19.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2017_Honda_CR-V_Touring.jpg/960px-2017_Honda_CR-V_Touring.jpg',
  ],
  // Chevrolet Spark 2020 (M400 facelift)
  spark: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/2020_Chevrolet_Spark_LS_in_Mosaic_Black_Metallic%2C_Front_Right%2C_04-03-2022.jpg/960px-2020_Chevrolet_Spark_LS_in_Mosaic_Black_Metallic%2C_Front_Right%2C_04-03-2022.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/2020_Chevrolet_Spark_LS_in_Mosaic_Black_Metallic%2C_Rear_Right%2C_04-03-2022.jpg/960px-2020_Chevrolet_Spark_LS_in_Mosaic_Black_Metallic%2C_Rear_Right%2C_04-03-2022.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/2020_Chevrolet_Spark_LS_CVT%2C_Front_Left%2C_07-01-2021.jpg/960px-2020_Chevrolet_Spark_LS_CVT%2C_Front_Left%2C_07-01-2021.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/2020_Chevrolet_Spark_LS_CVT%2C_Rear_Left%2C_07-01-2021.jpg/960px-2020_Chevrolet_Spark_LS_CVT%2C_Rear_Left%2C_07-01-2021.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2020_Chevrolet_Spark_LS%2C_front_right%2C_09-07-2024.jpg/960px-2020_Chevrolet_Spark_LS%2C_front_right%2C_09-07-2024.jpg',
  ],
  // Nissan Versa 2018 (N17 sedán, facelift 2015-2019)
  versa: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/2018_Nissan_Versa_in_cyan_%28resprayed%29%2C_front_left%2C_10-11-2025.jpg/960px-2018_Nissan_Versa_in_cyan_%28resprayed%29%2C_front_left%2C_10-11-2025.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/2018_Nissan_Versa_in_cyan_%28resprayed%29%2C_rear_left%2C_10-11-2025.jpg/960px-2018_Nissan_Versa_in_cyan_%28resprayed%29%2C_rear_left%2C_10-11-2025.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/18_Nissan_Versa_SV.jpg/960px-18_Nissan_Versa_SV.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/19_Nissan_Versa_SV.jpg/960px-19_Nissan_Versa_SV.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2015_Nissan_Versa_SV_%28facelift_model%29%2C_front_right.jpg/960px-2015_Nissan_Versa_SV_%28facelift_model%29%2C_front_right.jpg',
  ],
};

module.exports = { FOTOS_VEHICULOS };
