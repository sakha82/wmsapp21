param(
    [string]$WorkspaceRoot = 'c:\angular\wmsapp21'
)

$ErrorActionPreference = 'Stop'

$vehicleModelsPath = Join-Path $WorkspaceRoot 'docs\repairtime\VehicleModels.csv'

function New-Key {
    param(
        [string]$Make,
        [string]$Model
    )

    return ($Make.Trim().ToUpperInvariant() + '|' + $Model.Trim().ToUpperInvariant())
}

function Add-Keys {
    param(
        [System.Collections.Generic.HashSet[string]]$Set,
        [object[]]$Pairs
    )

    foreach ($pair in $Pairs) {
        [void]$Set.Add((New-Key -Make $pair[0] -Model $pair[1]))
    }
}

function In-Set {
    param(
        [System.Collections.Generic.HashSet[string]]$Set,
        [string]$Make,
        [string]$Model
    )

    return $Set.Contains((New-Key -Make $Make -Model $Model))
}

$allowedCategories = @('small', 'sedan', 'suv', 'premium', 'transporter', 'el')
$allowedSegments = @('mini', 'compact', 'mid_size', 'full_size', 'luxury')
$allowedFuelTypes = @('petrol', 'diesel', 'diesel_petrol', 'hybrid', 'electric')

$premiumMakes = @(
    'ASTON MARTIN', 'AUDI', 'BENTLEY', 'BMW', 'BUGATTI', 'CADILLAC', 'FERRARI',
    'GENESIS', 'INFINITI', 'JAGUAR', 'LAMBORGHINI', 'LAND ROVER', 'LEXUS',
    'LOTUS', 'MASERATI', 'MCLAREN', 'MERCEDES-BENZ', 'POLESTAR', 'PORSCHE',
    'ROLLS-ROYCE'
)

$electricKeys = [System.Collections.Generic.HashSet[string]]::new()
Add-Keys $electricKeys @(
    @('AIWAYS', 'U5'), @('AIWAYS', 'U6'),
    @('AUDI', 'e-tron'), @('AUDI', 'Q4 e-tron'), @('AUDI', 'e-tron GT'), @('AUDI', 'Q6 e-tron'),
    @('BMW', 'i3'), @('BMW', 'i4'), @('BMW', 'i5'), @('BMW', 'i7'), @('BMW', 'iX'), @('BMW', 'iX3'),
    @('BYD', 'Atto 3'), @('BYD', 'Dolphin'), @('BYD', 'Han'), @('BYD', 'Seal'), @('BYD', 'Seal U'), @('BYD', 'Tang'),
    @('CUPRA', 'Born'), @('CUPRA', 'Tavascan'),
    @('DACIA', 'Spring'),
    @('GENESIS', 'Electrified G80'), @('GENESIS', 'GV60'),
    @('HONDA', 'e'), @('HONDA', 'e:Ny1'),
    @('HYUNDAI', 'Ioniq 5'), @('HYUNDAI', 'Ioniq 6'), @('HYUNDAI', 'Inster'), @('HYUNDAI', 'Nexo'),
    @('JAGUAR', 'I-Pace'),
    @('KIA', 'EV3'), @('KIA', 'EV6'), @('KIA', 'EV9'),
    @('LOTUS', 'Eletre'),
    @('MERCEDES-BENZ', 'EQA'), @('MERCEDES-BENZ', 'EQB'), @('MERCEDES-BENZ', 'EQC'), @('MERCEDES-BENZ', 'EQE'),
    @('MERCEDES-BENZ', 'EQE SUV'), @('MERCEDES-BENZ', 'EQS'), @('MERCEDES-BENZ', 'EQS SUV'),
    @('MG', 'MG4'), @('MG', 'MG5'), @('MG', 'Marvel R'), @('MG', 'ZS EV'),
    @('MITSUBISHI', 'i-MiEV'),
    @('NIO', 'EC6'), @('NIO', 'EL6'), @('NIO', 'EL7'), @('NIO', 'ES6'), @('NIO', 'ES8'), @('NIO', 'ET5'), @('NIO', 'ET7'),
    @('NISSAN', 'Ariya'), @('NISSAN', 'e-NV200'), @('NISSAN', 'Leaf'),
    @('ORA', 'Funky Cat (03)'),
    @('POLESTAR', '2'), @('POLESTAR', '3'), @('POLESTAR', '4'),
    @('RENAULT', 'Megane E-Tech'), @('RENAULT', 'Scenic E-Tech'), @('RENAULT', 'Twizy'), @('RENAULT', 'Zoe'),
    @('SKODA', 'Enyaq'),
    @('SUBARU', 'Solterra'),
    @('TESLA', 'Model 3'), @('TESLA', 'Model S'), @('TESLA', 'Model X'), @('TESLA', 'Model Y'), @('TESLA', 'Roadster (2008)'),
    @('TOYOTA', 'bZ4X'),
    @('VOLKSWAGEN', 'ID.3'), @('VOLKSWAGEN', 'ID.4'), @('VOLKSWAGEN', 'ID.5'), @('VOLKSWAGEN', 'ID.7'), @('VOLKSWAGEN', 'ID.Buzz'),
    @('VOLVO', 'C40'), @('VOLVO', 'EC40'), @('VOLVO', 'EX30'), @('VOLVO', 'EX90'),
    @('XPENG', 'G9'), @('XPENG', 'P7')
)

$hybridKeys = [System.Collections.Generic.HashSet[string]]::new()
Add-Keys $hybridKeys @(
    @('HONDA', 'Insight'),
    @('HYUNDAI', 'Ioniq'),
    @('KIA', 'Niro'),
    @('LEXUS', 'CT'), @('LEXUS', 'ES'), @('LEXUS', 'GS'), @('LEXUS', 'IS'), @('LEXUS', 'LBX'), @('LEXUS', 'LS'), @('LEXUS', 'NX'), @('LEXUS', 'RX'), @('LEXUS', 'UX'),
    @('LYNK & CO', '01'),
    @('RENAULT', 'Arkana'),
    @('SUZUKI', 'Across'), @('SUZUKI', 'Swace'),
    @('TOYOTA', 'C-HR'), @('TOYOTA', 'Camry'), @('TOYOTA', 'Corolla Cross'), @('TOYOTA', 'Highlander'), @('TOYOTA', 'Prius'), @('TOYOTA', 'Prius+'), @('TOYOTA', 'Yaris Cross')
)

$transporterKeys = [System.Collections.Generic.HashSet[string]]::new()
Add-Keys $transporterKeys @(
    @('CITROEN', 'Berlingo'), @('CITROEN', 'Jumpy'), @('CITROEN', 'SpaceTourer'),
    @('CHRYSLER', 'Grand Voyager'), @('CHRYSLER', 'Voyager'),
    @('FIAT', 'Doblo'), @('Ford', 'Transit'), @('FORD', 'Transit Connect'), @('FORD', 'Transit Custom'), @('FORD', 'Tourneo Connect'), @('FORD', 'Tourneo Custom'),
    @('IVECO', 'Daily (VI)'),
    @('MERCEDES-BENZ', 'Citan'), @('MERCEDES-BENZ', 'T-Class'), @('MERCEDES-BENZ', 'V-Class'), @('MERCEDES-BENZ', 'Vaneo'),
    @('OPEL', 'Combo'), @('OPEL', 'Combo Life'),
    @('PEUGEOT', 'Partner Tepee'), @('PEUGEOT', 'ProAce City'), @('PEUGEOT', 'Traveller'),
    @('RENAULT', 'Kangoo'),
    @('TOYOTA', 'ProAce (MPV)'), @('TOYOTA', 'ProAce City'), @('TOYOTA', 'ProAce Verso'),
    @('VOLKSWAGEN', 'Amarok'), @('VOLKSWAGEN', 'Caddy'), @('VOLKSWAGEN', 'Caravelle'), @('VOLKSWAGEN', 'Crafter'), @('VOLKSWAGEN', 'Multivan'), @('VOLKSWAGEN', 'Sharan'), @('VOLKSWAGEN', 'Transporter')
)

$suvKeys = [System.Collections.Generic.HashSet[string]]::new()
Add-Keys $suvKeys @(
    @('ALFA ROMEO', 'Stelvio'), @('ALFA ROMEO', 'Tonale'),
    @('AUDI', 'Q2'), @('AUDI', 'Q3'), @('AUDI', 'Q5'), @('AUDI', 'Q6 e-tron'), @('AUDI', 'Q7'), @('AUDI', 'Q8'),
    @('BMW', 'X1'), @('BMW', 'X2'), @('BMW', 'X3'), @('BMW', 'X4'), @('BMW', 'X5'), @('BMW', 'X6'), @('BMW', 'X7'), @('BMW', 'XM'),
    @('BENTLEY', 'Bentayga'), @('BYD', 'Atto 3'), @('BYD', 'Seal U'), @('BYD', 'Tang'),
    @('CADILLAC', 'Escalade'), @('CADILLAC', 'SRX'),
    @('CHEVROLET', 'Captiva'), @('CHEVROLET', 'Trax'),
    @('CITROEN', 'C3 Aircross'), @('CITROEN', 'C-Crosser'), @('CITROEN', 'C4 Cactus'), @('CITROEN', 'C5 Aircross'),
    @('CUPRA', 'Ateca'), @('CUPRA', 'Formentor'), @('CUPRA', 'Tavascan'),
    @('DACIA', 'Duster'),
    @('DS AUTOMOBILES', 'DS7 Crossback'),
    @('FORD', 'EcoSport'), @('FORD', 'Edge'), @('FORD', 'Explorer'), @('FORD', 'Kuga'), @('FORD', 'Mustang Mach-E'), @('FORD', 'Puma'),
    @('GENESIS', 'GV60'), @('GENESIS', 'GV70'), @('GENESIS', 'GV80'),
    @('HONDA', 'CR-V'), @('HONDA', 'HR-V'), @('HONDA', 'ZR-V'),
    @('HYUNDAI', 'Bayon'), @('HYUNDAI', 'Kona'), @('HYUNDAI', 'Santa Fe'), @('HYUNDAI', 'Terracan'), @('HYUNDAI', 'Tucson'), @('HYUNDAI', 'ix35'),
    @('INFINITI', 'EX'), @('INFINITI', 'FX'), @('INFINITI', 'QX30'), @('INFINITI', 'QX50'), @('INFINITI', 'QX70'),
    @('JAGUAR', 'E-Pace'), @('JAGUAR', 'F-Pace'), @('JAGUAR', 'I-Pace'),
    @('JEEP', 'Cherokee'), @('JEEP', 'Commander'), @('JEEP', 'Compass'), @('JEEP', 'Grand Cherokee'), @('JEEP', 'Renegade'), @('JEEP', 'Wrangler'),
    @('KIA', 'EV3'), @('KIA', 'EV6'), @('KIA', 'EV9'), @('KIA', 'Niro'), @('KIA', 'Sorento'), @('KIA', 'Soul'), @('KIA', 'Sportage'), @('KIA', 'Stonic'), @('KIA', 'XCeed'),
    @('LAMBORGHINI', 'Urus'), @('LAND ROVER', 'Defender'), @('LAND ROVER', 'Discovery'), @('LAND ROVER', 'Discovery Sport'), @('LAND ROVER', 'Freelander'), @('LAND ROVER', 'Range Rover'), @('LAND ROVER', 'Range Rover Evoque'), @('LAND ROVER', 'Range Rover Sport'), @('LAND ROVER', 'Range Rover Velar'),
    @('LEXUS', 'NX'), @('LEXUS', 'RX'), @('LEXUS', 'UX'), @('LEXUS', 'RZ'),
    @('LOTUS', 'Eletre'),
    @('MASERATI', 'Grecale'), @('MASERATI', 'Levante'),
    @('MAZDA', 'CX-3'), @('MAZDA', 'CX-30'), @('MAZDA', 'CX-5'), @('MAZDA', 'CX-60'), @('MAZDA', 'CX-7'), @('MAZDA', 'CX-80'),
    @('MERCEDES-BENZ', 'EQE SUV'), @('MERCEDES-BENZ', 'EQS SUV'), @('MERCEDES-BENZ', 'G-Class'), @('MERCEDES-BENZ', 'GLA'), @('MERCEDES-BENZ', 'GLB'), @('MERCEDES-BENZ', 'GLC'), @('MERCEDES-BENZ', 'GLE'), @('MERCEDES-BENZ', 'GLS'),
    @('MG', 'HS'), @('MG', 'Marvel R'), @('MG', 'ZS'), @('MG', 'ZS EV'),
    @('MITSUBISHI', 'ASX'), @('MITSUBISHI', 'Eclipse Cross'), @('MITSUBISHI', 'Outlander'), @('MITSUBISHI', 'Pajero'),
    @('NIO', 'EC6'), @('NIO', 'EL6'), @('NIO', 'EL7'), @('NIO', 'ES6'), @('NIO', 'ES8'),
    @('NISSAN', 'Ariya'), @('NISSAN', 'Juke'), @('NISSAN', 'Murano'), @('NISSAN', 'Pathfinder'), @('NISSAN', 'Qashqai'), @('NISSAN', 'X-Trail'),
    @('OPEL', 'Antara'), @('OPEL', 'Crossland'), @('OPEL', 'Frontera'), @('OPEL', 'Grandland'), @('OPEL', 'Mokka'),
    @('ORA', 'Funky Cat (03)'),
    @('PEUGEOT', '2008'), @('PEUGEOT', '3008'), @('PEUGEOT', '4007'), @('PEUGEOT', '4008'), @('PEUGEOT', '5008'),
    @('PORSCHE', 'Cayenne'), @('PORSCHE', 'Macan'),
    @('RENAULT', 'Arkana'), @('RENAULT', 'Austral'), @('RENAULT', 'Captur'), @('RENAULT', 'Kadjar'), @('RENAULT', 'Koleos'),
    @('ROLLS-ROYCE', 'Cullinan'),
    @('SAAB', '9-4X'),
    @('SEAT', 'Arona'), @('SEAT', 'Ateca'), @('SEAT', 'Tarraco'),
    @('SKODA', 'Kamiq'), @('SKODA', 'Karoq'), @('SKODA', 'Kodiaq'), @('SKODA', 'Yeti'),
    @('SSANGYONG', 'Actyon'), @('SSANGYONG', 'Korando'), @('SSANGYONG', 'Kyron'), @('SSANGYONG', 'Musso'), @('SSANGYONG', 'Rexton'), @('SSANGYONG', 'Tivoli'), @('SSANGYONG', 'Torres'),
    @('SUBARU', 'Crosstrek'), @('SUBARU', 'Forester'), @('SUBARU', 'Outback'), @('SUBARU', 'Solterra'), @('SUBARU', 'Tribeca'), @('SUBARU', 'XV'),
    @('SUZUKI', 'Across'), @('SUZUKI', 'Grand Vitara'), @('SUZUKI', 'Ignis'), @('SUZUKI', 'Jimny'), @('SUZUKI', 'SX4 S-Cross'), @('SUZUKI', 'Vitara'),
    @('TESLA', 'Model X'), @('TESLA', 'Model Y'),
    @('TOYOTA', 'bZ4X'), @('TOYOTA', 'C-HR'), @('TOYOTA', 'Corolla Cross'), @('TOYOTA', 'Highlander'), @('TOYOTA', 'Land Cruiser'), @('TOYOTA', 'RAV4'), @('TOYOTA', 'Urban Cruiser'), @('TOYOTA', 'Yaris Cross'),
    @('VOLKSWAGEN', 'T-Cross'), @('VOLKSWAGEN', 'Taigo'), @('VOLKSWAGEN', 'Tiguan'), @('VOLKSWAGEN', 'Touareg'), @('VOLKSWAGEN', 'T-Roc'),
    @('VOLVO', 'XC40'), @('VOLVO', 'XC60'), @('VOLVO', 'XC70'), @('VOLVO', 'XC90'),
    @('WEY', 'Coffee 01'), @('WEY', 'Coffee 02'), @('XPENG', 'G9')
)

$premiumCategoryKeys = [System.Collections.Generic.HashSet[string]]::new()
Add-Keys $premiumCategoryKeys @(
    @('ALFA ROMEO', '4C'), @('ALFA ROMEO', 'Brera'), @('ALFA ROMEO', 'GT'), @('ALFA ROMEO', 'GTV'), @('ALFA ROMEO', 'Spider'),
    @('AUDI', 'R8'), @('AUDI', 'TT'),
    @('BMW', 'Z3'), @('BMW', 'Z4'), @('BMW', 'Z8'),
    @('CHEVROLET', 'Camaro'), @('CHEVROLET', 'Corvette'),
    @('FERRARI', '348'), @('FERRARI', '355'), @('FERRARI', '360'), @('FERRARI', '458 Italia'), @('FERRARI', '488'), @('FERRARI', '812 GTS'), @('FERRARI', '812 Superfast'), @('FERRARI', 'F430'), @('FERRARI', 'F8 Tributo'), @('FERRARI', 'LaFerrari'), @('FERRARI', 'Portofino'), @('FERRARI', 'Roma'), @('FERRARI', 'SF90 Stradale'), @('FERRARI', '296 GTB'),
    @('FORD', 'Mustang'),
    @('HONDA', 'NSX'), @('HONDA', 'Prelude'), @('HONDA', 'S2000'),
    @('JAGUAR', 'F-Type'), @('JAGUAR', 'XK'),
    @('LAMBORGHINI', 'Aventador'), @('LAMBORGHINI', 'Diablo'), @('LAMBORGHINI', 'Gallardo'), @('LAMBORGHINI', 'Huracan'), @('LAMBORGHINI', 'Murcielago'), @('LAMBORGHINI', 'Sian'),
    @('LOTUS', 'Elise'), @('LOTUS', 'Emira'), @('LOTUS', 'Evora'), @('LOTUS', 'Exige'),
    @('MASERATI', 'GranCabrio'), @('MASERATI', 'GranTurismo'), @('MASERATI', 'MC20'),
    @('MCLAREN', '12C'), @('MCLAREN', '540C'), @('MCLAREN', '570S'), @('MCLAREN', '600LT'), @('MCLAREN', '650S'), @('MCLAREN', '675LT'), @('MCLAREN', '720S'), @('MCLAREN', '765LT'), @('MCLAREN', 'Artura'), @('MCLAREN', 'Elva'), @('MCLAREN', 'GT'), @('MCLAREN', 'P1'), @('MCLAREN', 'Senna'), @('MCLAREN', 'Speedtail'),
    @('MERCEDES-BENZ', 'AMG GT'), @('MERCEDES-BENZ', 'SL'), @('MERCEDES-BENZ', 'SLC'), @('MERCEDES-BENZ', 'SLK'), @('MERCEDES-BENZ', 'SLS AMG'),
    @('MG', 'Cyberster'),
    @('PORSCHE', '911'), @('PORSCHE', 'Boxster'), @('PORSCHE', 'Cayman'),
    @('RENAULT', 'Twizy'),
    @('TOYOTA', 'Celica'), @('TOYOTA', 'GR86'), @('TOYOTA', 'GT86'), @('TOYOTA', 'MR2'), @('TOYOTA', 'Supra')
)

$miniSegmentKeys = [System.Collections.Generic.HashSet[string]]::new()
Add-Keys $miniSegmentKeys @(
    @('CITROEN', 'AX'), @('CITROEN', 'C1'), @('CITROEN', 'C2'), @('CITROEN', 'Saxo'),
    @('CHEVROLET', 'Matiz'), @('CHEVROLET', 'Spark'),
    @('DAIHATSU', 'Charade'), @('DAIHATSU', 'Cuore'), @('DAIHATSU', 'Sirion'), @('DAIHATSU', 'Trevis'),
    @('DACIA', 'Spring'),
    @('FIAT', '500'), @('FIAT', 'Panda'), @('FIAT', 'Seicento'), @('FIAT', 'Uno'),
    @('FORD', 'Ka'),
    @('HONDA', 'e'),
    @('HYUNDAI', 'I10'),
    @('KIA', 'Picanto'),
    @('MINI', 'Hatch'),
    @('NISSAN', 'Micra'),
    @('OPEL', 'Adam'), @('OPEL', 'Karl'),
    @('PEUGEOT', '106'), @('PEUGEOT', '107'), @('PEUGEOT', '108'),
    @('RENAULT', 'Twingo'),
    @('SEAT', 'Mii'), @('SEAT', 'Mii Electric'),
    @('SKODA', 'Citigo'),
    @('SMART', 'City-Coupe (Fortwo)'), @('SMART', 'Fortwo'),
    @('SUZUKI', 'Alto'), @('SUZUKI', 'Celerio'),
    @('TOYOTA', 'Aygo'), @('TOYOTA', 'Aygo X'), @('TOYOTA', 'iQ'),
    @('VOLKSWAGEN', 'Fox'), @('VOLKSWAGEN', 'Lupo'), @('VOLKSWAGEN', 'up!')
)

$compactSegmentKeys = [System.Collections.Generic.HashSet[string]]::new()
Add-Keys $compactSegmentKeys @(
    @('AUDI', 'A1'), @('AUDI', 'A2'), @('AUDI', 'A3'), @('AUDI', 'Q4 e-tron'),
    @('BMW', '1 Series'), @('BMW', '2 Series'), @('BMW', '2 Active Tourer'), @('BMW', '2 Gran Tourer'), @('BMW', 'i3'),
    @('BYD', 'Dolphin'),
    @('CHEVROLET', 'Aveo'), @('CHEVROLET', 'Cruze'), @('CHEVROLET', 'Kalos'), @('CHEVROLET', 'Lacetti'), @('CHEVROLET', 'Orlando'),
    @('CITROEN', 'C3'), @('CITROEN', 'C3 Picasso'), @('CITROEN', 'C4'), @('CITROEN', 'C4 Picasso'), @('CITROEN', 'Grand C4 Picasso'), @('CITROEN', 'Xsara'),
    @('CUPRA', 'Born'), @('CUPRA', 'Leon'),
    @('DACIA', 'Jogger'), @('DACIA', 'Logan'), @('DACIA', 'Sandero'),
    @('DS AUTOMOBILES', 'DS3'), @('DS AUTOMOBILES', 'DS4'),
    @('FIAT', '500L'), @('FIAT', '500X'), @('FIAT', 'Bravo'), @('FIAT', 'Brava'), @('FIAT', 'Grande Punto'), @('FIAT', 'Idea'), @('FIAT', 'Multipla'), @('FIAT', 'Punto'), @('FIAT', 'Stilo'), @('FIAT', 'Tipo'),
    @('FORD', 'B-MAX'), @('FORD', 'C-MAX'), @('FORD', 'Fiesta'), @('FORD', 'Focus'), @('FORD', 'Fusion'), @('FORD', 'Puma'),
    @('HONDA', 'Civic'), @('HONDA', 'FR-V'), @('HONDA', 'Jazz'),
    @('HYUNDAI', 'Accent'), @('HYUNDAI', 'Bayon'), @('HYUNDAI', 'Coupe'), @('HYUNDAI', 'Elantra'), @('HYUNDAI', 'Getz'), @('HYUNDAI', 'I20'), @('HYUNDAI', 'I30'), @('HYUNDAI', 'Inster'), @('HYUNDAI', 'ix20'),
    @('KIA', 'Carens'), @('KIA', 'Ceed'), @('KIA', 'ProCeed'), @('KIA', 'Rio'), @('KIA', 'Stonic'), @('KIA', 'Venga'), @('KIA', 'XCeed'),
    @('LEXUS', 'CT'), @('LEXUS', 'UX'), @('LYNK & CO', '01'), @('LYNK & CO', '02'),
    @('MAZDA', '2'), @('MAZDA', '3'), @('MAZDA', '5'), @('MAZDA', 'MX-30'),
    @('MERCEDES-BENZ', 'A-Class'), @('MERCEDES-BENZ', 'B-Class'), @('MERCEDES-BENZ', 'CLA'), @('MERCEDES-BENZ', 'CLC'), @('MERCEDES-BENZ', 'EQA'), @('MERCEDES-BENZ', 'EQB'), @('MERCEDES-BENZ', 'GLA'), @('MERCEDES-BENZ', 'GLB'),
    @('MG', 'MG3'), @('MG', 'MG4'), @('MG', 'MG5'), @('MG', 'ZS'), @('MG', 'ZS EV'), @('MG', 'ZR'),
    @('MITSUBISHI', 'ASX'), @('MITSUBISHI', 'Carisma'), @('MITSUBISHI', 'Colt'), @('MITSUBISHI', 'i-MiEV'), @('MITSUBISHI', 'Space Star'),
    @('NISSAN', 'Almera'), @('NISSAN', 'Juke'), @('NISSAN', 'Leaf'), @('NISSAN', 'Note'), @('NISSAN', 'Pulsar'),
    @('OPEL', 'Astra'), @('OPEL', 'Corsa'), @('OPEL', 'Meriva'), @('OPEL', 'Mokka'), @('OPEL', 'Tigra'), @('OPEL', 'Zafira'), @('OPEL', 'Zafira Tourer'),
    @('PEUGEOT', '2008'), @('PEUGEOT', '206'), @('PEUGEOT', '207'), @('PEUGEOT', '208'), @('PEUGEOT', '307'), @('PEUGEOT', '308'), @('PEUGEOT', '408'),
    @('RENAULT', 'Captur'), @('RENAULT', 'Clio'), @('RENAULT', 'Kadjar'), @('RENAULT', 'Kangoo'), @('RENAULT', 'Megane'), @('RENAULT', 'Megane E-Tech'), @('RENAULT', 'Modus'), @('RENAULT', 'Scenic'), @('RENAULT', 'Scenic E-Tech'), @('RENAULT', 'Zoe'),
    @('ROVER', '25'), @('ROVER', '45'), @('SEAT', 'Altea'), @('SEAT', 'Arona'), @('SEAT', 'Ateca'), @('SEAT', 'Ibiza'), @('SEAT', 'Leon'), @('SEAT', 'Toledo'),
    @('SKODA', 'Fabia'), @('SKODA', 'Kamiq'), @('SKODA', 'Rapid'), @('SKODA', 'Roomster'), @('SKODA', 'Scala'),
    @('SUBARU', 'BRZ'), @('SUBARU', 'Impreza'), @('SUBARU', 'Justy'), @('SUBARU', 'Levorg'), @('SUBARU', 'XV'),
    @('SUZUKI', 'Baleno'), @('SUZUKI', 'Ignis'), @('SUZUKI', 'Liana'), @('SUZUKI', 'Splash'), @('SUZUKI', 'Swift'), @('SUZUKI', 'SX4'), @('SUZUKI', 'SX4 S-Cross'),
    @('TESLA', 'Model 3'),
    @('TOYOTA', 'Auris'), @('TOYOTA', 'Corolla'), @('TOYOTA', 'Yaris'), @('TOYOTA', 'Yaris Cross'), @('TOYOTA', 'Verso-S'),
    @('VOLKSWAGEN', 'Beetle'), @('VOLKSWAGEN', 'Bora'), @('VOLKSWAGEN', 'Eos'), @('VOLKSWAGEN', 'Golf'), @('VOLKSWAGEN', 'Golf Plus'), @('VOLKSWAGEN', 'Golf Sportsvan'), @('VOLKSWAGEN', 'ID.3'), @('VOLKSWAGEN', 'Jetta'), @('VOLKSWAGEN', 'New Beetle'), @('VOLKSWAGEN', 'Polo'), @('VOLKSWAGEN', 'Scirocco'), @('VOLKSWAGEN', 'Taigo'), @('VOLKSWAGEN', 'T-Cross'), @('VOLKSWAGEN', 'T-Roc'),
    @('ORA', 'Funky Cat (03)'),
    @('POLESTAR', '2'),
    @('VOLVO', 'C30'), @('VOLVO', 'EX30'), @('VOLVO', 'S40'), @('VOLVO', 'V40'), @('VOLVO', 'V50'), @('VOLVO', 'XC40')
)

$fullSizeSegmentKeys = [System.Collections.Generic.HashSet[string]]::new()
Add-Keys $fullSizeSegmentKeys @(
    @('AUDI', 'A6'), @('AUDI', 'A7'), @('AUDI', 'Q7'), @('AUDI', 'Q8'),
    @('BMW', '5 Series'), @('BMW', '6 Series'), @('BMW', 'X5'), @('BMW', 'X6'), @('BMW', 'X7'),
    @('BYD', 'Han'), @('BYD', 'Tang'),
    @('CADILLAC', 'Escalade'), @('CHEVROLET', 'Orlando'),
    @('CITROEN', 'C5'), @('CITROEN', 'C5 X'), @('CITROEN', 'C6'), @('CITROEN', 'C8'),
    @('FORD', 'Edge'), @('FORD', 'Galaxy'), @('FORD', 'Mondeo'), @('FORD', 'S-MAX'), @('FORD', 'Transit'), @('FORD', 'Transit Custom'), @('FORD', 'Tourneo Custom'),
    @('HONDA', 'Accord'), @('HONDA', 'Legend'),
    @('HYUNDAI', 'I40'), @('HYUNDAI', 'Santa Fe'), @('HYUNDAI', 'Sonata'), @('HYUNDAI', 'Tucson'),
    @('IVECO', 'Daily (VI)'),
    @('JAGUAR', 'XF'),
    @('KIA', 'EV9'), @('KIA', 'Optima'), @('KIA', 'Sorento'), @('KIA', 'Stinger'),
    @('LAND ROVER', 'Defender'), @('LAND ROVER', 'Discovery'), @('LAND ROVER', 'Range Rover Sport'),
    @('LEXUS', 'ES'), @('LEXUS', 'RX'),
    @('MASERATI', 'Levante'),
    @('MERCEDES-BENZ', 'E-Class'), @('MERCEDES-BENZ', 'EQE SUV'), @('MERCEDES-BENZ', 'GLE'), @('MERCEDES-BENZ', 'GLS'), @('MERCEDES-BENZ', 'R-Class'), @('MERCEDES-BENZ', 'V-Class'),
    @('MITSUBISHI', 'Pajero'),
    @('NIO', 'ES8'), @('NIO', 'ET7'),
    @('NISSAN', 'Pathfinder'),
    @('PEUGEOT', '5008'), @('PEUGEOT', '508'), @('PEUGEOT', '607'), @('PEUGEOT', 'Traveller'),
    @('PORSCHE', 'Cayenne'), @('PORSCHE', 'Panamera'),
    @('RENAULT', 'Espace'), @('RENAULT', 'Koleos'), @('RENAULT', 'Talisman'), @('RENAULT', 'Vel Satis'),
    @('SEAT', 'Alhambra'), @('SEAT', 'Tarraco'),
    @('SKODA', 'Kodiaq'), @('SKODA', 'Superb'),
    @('SUBARU', 'Tribeca'),
    @('TESLA', 'Model S'), @('TESLA', 'Model X'),
    @('TOYOTA', 'Camry'), @('TOYOTA', 'Highlander'), @('TOYOTA', 'Land Cruiser'), @('TOYOTA', 'ProAce Verso'), @('TOYOTA', 'Verso'),
    @('VOLKSWAGEN', 'Arteon'), @('VOLKSWAGEN', 'Crafter'), @('VOLKSWAGEN', 'ID.7'), @('VOLKSWAGEN', 'Passat'), @('VOLKSWAGEN', 'Sharan'), @('VOLKSWAGEN', 'Touareg'), @('VOLKSWAGEN', 'Transporter'),
    @('VOLVO', 'EX90'), @('VOLVO', 'S80'), @('VOLVO', 'S90'), @('VOLVO', 'V70'), @('VOLVO', 'V90'), @('VOLVO', 'XC90'),
    @('XPENG', 'G9')
)

$luxurySegmentKeys = [System.Collections.Generic.HashSet[string]]::new()
Add-Keys $luxurySegmentKeys @(
    @('AUDI', 'A8'), @('AUDI', 'e-tron GT'), @('BENTLEY', 'Arnage'), @('BENTLEY', 'Azure'), @('BENTLEY', 'Bentayga'), @('BENTLEY', 'Brooklands'), @('BENTLEY', 'Continental Flying Spur'), @('BENTLEY', 'Continental GT'), @('BENTLEY', 'Flying Spur'), @('BENTLEY', 'Mulsanne'),
    @('BMW', '7 Series'), @('BMW', '8 Series'), @('BMW', 'XM'), @('BMW', 'i7'),
    @('BUGATTI', 'Centodieci'), @('BUGATTI', 'Chiron'), @('BUGATTI', 'Divo'), @('BUGATTI', 'EB110'), @('BUGATTI', 'Mistral'), @('BUGATTI', 'Veyron'),
    @('CADILLAC', 'Escalade'), @('CADILLAC', 'XTS'),
    @('FERRARI', '348'), @('FERRARI', '355'), @('FERRARI', '360'), @('FERRARI', '458 Italia'), @('FERRARI', '488'), @('FERRARI', '812 GTS'), @('FERRARI', '812 Superfast'), @('FERRARI', 'F430'), @('FERRARI', 'F8 Tributo'), @('FERRARI', 'LaFerrari'), @('FERRARI', 'Portofino'), @('FERRARI', 'Roma'), @('FERRARI', 'SF90 Stradale'), @('FERRARI', '296 GTB'),
    @('GENESIS', 'Electrified G80'), @('GENESIS', 'G80'), @('GENESIS', 'GV80'),
    @('JAGUAR', 'XJ'),
    @('LAMBORGHINI', 'Aventador'), @('LAMBORGHINI', 'Diablo'), @('LAMBORGHINI', 'Gallardo'), @('LAMBORGHINI', 'Huracan'), @('LAMBORGHINI', 'Murcielago'), @('LAMBORGHINI', 'Sian'), @('LAMBORGHINI', 'Urus'),
    @('LAND ROVER', 'Range Rover'),
    @('LEXUS', 'LC'), @('LEXUS', 'LS'),
    @('LOTUS', 'Eletre'),
    @('MASERATI', 'Ghibli'), @('MASERATI', 'GranCabrio'), @('MASERATI', 'GranTurismo'), @('MASERATI', 'Levante'), @('MASERATI', 'MC20'), @('MASERATI', 'Quattroporte'),
    @('MAYBACH', '57'), @('MAYBACH', '62'),
    @('MCLAREN', '12C'), @('MCLAREN', '540C'), @('MCLAREN', '570S'), @('MCLAREN', '600LT'), @('MCLAREN', '650S'), @('MCLAREN', '675LT'), @('MCLAREN', '720S'), @('MCLAREN', '765LT'), @('MCLAREN', 'Artura'), @('MCLAREN', 'Elva'), @('MCLAREN', 'GT'), @('MCLAREN', 'P1'), @('MCLAREN', 'Senna'), @('MCLAREN', 'Speedtail'),
    @('MERCEDES-BENZ', 'AMG GT'), @('MERCEDES-BENZ', 'EQS'), @('MERCEDES-BENZ', 'EQS SUV'), @('MERCEDES-BENZ', 'G-Class'), @('MERCEDES-BENZ', 'S-Class'), @('MERCEDES-BENZ', 'SLS AMG'),
    @('PORSCHE', '911'), @('PORSCHE', 'Taycan'),
    @('NIO', 'ET7'),
    @('ROLLS-ROYCE', 'Cullinan'), @('ROLLS-ROYCE', 'Dawn'), @('ROLLS-ROYCE', 'Ghost'), @('ROLLS-ROYCE', 'Phantom'), @('ROLLS-ROYCE', 'Silver Seraph'), @('ROLLS-ROYCE', 'Wraith'),
    @('TESLA', 'Model S')
)

$petrolOnlyKeys = [System.Collections.Generic.HashSet[string]]::new()
Add-Keys $petrolOnlyKeys @(
    @('ALFA ROMEO', '4C'), @('ALFA ROMEO', 'Brera'), @('ALFA ROMEO', 'GTV'), @('ALFA ROMEO', 'Spider'),
    @('ASTON MARTIN', 'Cygnet'), @('ASTON MARTIN', 'DB7'), @('ASTON MARTIN', 'DB9'), @('ASTON MARTIN', 'DB11'), @('ASTON MARTIN', 'DB12'), @('ASTON MARTIN', 'Rapide'), @('ASTON MARTIN', 'Vanquish'), @('ASTON MARTIN', 'Vantage'), @('ASTON MARTIN', 'Valkyrie'), @('ASTON MARTIN', 'Virage'),
    @('AUDI', 'R8'), @('AUDI', 'TT'),
    @('BENTLEY', 'Arnage'), @('BENTLEY', 'Azure'), @('BENTLEY', 'Bentayga'), @('BENTLEY', 'Brooklands'), @('BENTLEY', 'Continental Flying Spur'), @('BENTLEY', 'Continental GT'), @('BENTLEY', 'Flying Spur'), @('BENTLEY', 'Mulsanne'),
    @('BMW', 'Z3'), @('BMW', 'Z4'), @('BMW', 'Z8'),
    @('BUGATTI', 'Centodieci'), @('BUGATTI', 'Chiron'), @('BUGATTI', 'Divo'), @('BUGATTI', 'EB110'), @('BUGATTI', 'Mistral'), @('BUGATTI', 'Veyron'),
    @('CHEVROLET', 'Camaro'), @('CHEVROLET', 'Corvette'),
    @('FERRARI', '348'), @('FERRARI', '355'), @('FERRARI', '360'), @('FERRARI', '458 Italia'), @('FERRARI', '488'), @('FERRARI', '812 GTS'), @('FERRARI', '812 Superfast'), @('FERRARI', 'F430'), @('FERRARI', 'F8 Tributo'), @('FERRARI', 'LaFerrari'), @('FERRARI', 'Portofino'), @('FERRARI', 'Roma'), @('FERRARI', 'SF90 Stradale'), @('FERRARI', '296 GTB'),
    @('FORD', 'Mustang'),
    @('HONDA', 'NSX'), @('HONDA', 'Prelude'), @('HONDA', 'S2000'),
    @('JAGUAR', 'F-Type'), @('JAGUAR', 'XK'),
    @('LAMBORGHINI', 'Aventador'), @('LAMBORGHINI', 'Diablo'), @('LAMBORGHINI', 'Gallardo'), @('LAMBORGHINI', 'Huracan'), @('LAMBORGHINI', 'Murcielago'), @('LAMBORGHINI', 'Sian'), @('LAMBORGHINI', 'Urus'),
    @('LOTUS', 'Elise'), @('LOTUS', 'Emira'), @('LOTUS', 'Evora'), @('LOTUS', 'Exige'),
    @('MASERATI', 'GranCabrio'), @('MASERATI', 'GranTurismo'), @('MASERATI', 'MC20'),
    @('MCLAREN', '12C'), @('MCLAREN', '540C'), @('MCLAREN', '570S'), @('MCLAREN', '600LT'), @('MCLAREN', '650S'), @('MCLAREN', '675LT'), @('MCLAREN', '720S'), @('MCLAREN', '765LT'), @('MCLAREN', 'Artura'), @('MCLAREN', 'Elva'), @('MCLAREN', 'GT'), @('MCLAREN', 'P1'), @('MCLAREN', 'Senna'), @('MCLAREN', 'Speedtail'),
    @('MERCEDES-BENZ', 'AMG GT'), @('MERCEDES-BENZ', 'SL'), @('MERCEDES-BENZ', 'SLC'), @('MERCEDES-BENZ', 'SLK'), @('MERCEDES-BENZ', 'SLS AMG'),
    @('PORSCHE', '911'), @('PORSCHE', 'Boxster'), @('PORSCHE', 'Cayman'), @('PORSCHE', 'Panamera'),
    @('TESLA', 'Roadster (2008)'),
    @('TOYOTA', 'Celica'), @('TOYOTA', 'GR86'), @('TOYOTA', 'GT86'), @('TOYOTA', 'MR2'), @('TOYOTA', 'Supra')
)

$dieselOnlyKeys = [System.Collections.Generic.HashSet[string]]::new()
Add-Keys $dieselOnlyKeys @(
    @('Ford', 'Transit'), @('FORD', 'Transit Connect'), @('FORD', 'Transit Custom'), @('FORD', 'Tourneo Connect'), @('FORD', 'Tourneo Custom'),
    @('IVECO', 'Daily (VI)'),
    @('VOLKSWAGEN', 'Crafter'), @('VOLKSWAGEN', 'Transporter'), @('VOLKSWAGEN', 'Caravelle'), @('VOLKSWAGEN', 'Multivan'), @('VOLKSWAGEN', 'Amarok')
)

$additions = @(
    @{ Make = 'VOLVO'; Model = '960' }, @{ Make = 'VOLVO'; Model = 'S70' }, @{ Make = 'VOLVO'; Model = 'V50' }, @{ Make = 'VOLVO'; Model = 'C40' }, @{ Make = 'VOLVO'; Model = 'EC40' },
    @{ Make = 'AUDI'; Model = 'Q6 e-tron' },
    @{ Make = 'BMW'; Model = '2 Active Tourer' }, @{ Make = 'BMW'; Model = '2 Gran Tourer' }, @{ Make = 'BMW'; Model = 'XM' },
    @{ Make = 'BYD'; Model = 'Seal U' },
    @{ Make = 'CITROEN'; Model = 'C3 Picasso' }, @{ Make = 'CITROEN'; Model = 'C4 Picasso' }, @{ Make = 'CITROEN'; Model = 'Grand C4 Picasso' }, @{ Make = 'CITROEN'; Model = 'C5 Aircross' }, @{ Make = 'CITROEN'; Model = 'Jumpy' }, @{ Make = 'CITROEN'; Model = 'SpaceTourer' },
    @{ Make = 'CUPRA'; Model = 'Tavascan' },
    @{ Make = 'FIAT'; Model = 'Doblo' },
    @{ Make = 'FORD'; Model = 'Mustang Mach-E' }, @{ Make = 'FORD'; Model = 'Transit Connect' }, @{ Make = 'FORD'; Model = 'Transit Custom' }, @{ Make = 'FORD'; Model = 'Tourneo Connect' }, @{ Make = 'FORD'; Model = 'Tourneo Custom' }, @{ Make = 'FORD'; Model = 'Explorer' },
    @{ Make = 'HONDA'; Model = 'ZR-V' }, @{ Make = 'HONDA'; Model = 'e:Ny1' },
    @{ Make = 'HYUNDAI'; Model = 'ix20' }, @{ Make = 'HYUNDAI'; Model = 'ix35' }, @{ Make = 'HYUNDAI'; Model = 'Inster' },
    @{ Make = 'KIA'; Model = 'EV3' }, @{ Make = 'KIA'; Model = 'Venga' },
    @{ Make = 'LEXUS'; Model = 'LBX' }, @{ Make = 'LEXUS'; Model = 'RZ' },
    @{ Make = 'LYNK & CO'; Model = '02' },
    @{ Make = 'MERCEDES-BENZ'; Model = 'CLC' }, @{ Make = 'MERCEDES-BENZ'; Model = 'Citan' }, @{ Make = 'MERCEDES-BENZ'; Model = 'T-Class' }, @{ Make = 'MERCEDES-BENZ'; Model = 'V-Class' },
    @{ Make = 'MG'; Model = 'Cyberster' }, @{ Make = 'MG'; Model = 'ZS EV' },
    @{ Make = 'MITSUBISHI'; Model = 'Grandis' }, @{ Make = 'MITSUBISHI'; Model = 'Space Runner' }, @{ Make = 'MITSUBISHI'; Model = 'Space Wagon' },
    @{ Make = 'NIO'; Model = 'EL6' },
    @{ Make = 'NISSAN'; Model = 'Ariya' }, @{ Make = 'NISSAN'; Model = 'e-NV200' },
    @{ Make = 'OPEL'; Model = 'Ampera-e' }, @{ Make = 'OPEL'; Model = 'Cascada' }, @{ Make = 'OPEL'; Model = 'Combo' }, @{ Make = 'OPEL'; Model = 'Zafira Tourer' },
    @{ Make = 'PEUGEOT'; Model = '408' }, @{ Make = 'PEUGEOT'; Model = 'ProAce City' }, @{ Make = 'PEUGEOT'; Model = 'Rifter' }, @{ Make = 'PEUGEOT'; Model = 'Traveller' },
    @{ Make = 'POLESTAR'; Model = '3' }, @{ Make = 'POLESTAR'; Model = '4' },
    @{ Make = 'RENAULT'; Model = 'Kangoo' }, @{ Make = 'RENAULT'; Model = 'Megane E-Tech' }, @{ Make = 'RENAULT'; Model = 'Scenic E-Tech' },
    @{ Make = 'SEAT'; Model = 'Mii Electric' },
    @{ Make = 'SKODA'; Model = 'Citigo' }, @{ Make = 'SKODA'; Model = 'Scala' },
    @{ Make = 'SUBARU'; Model = 'Solterra' },
    @{ Make = 'SUZUKI'; Model = 'Across' }, @{ Make = 'SUZUKI'; Model = 'Swace' },
    @{ Make = 'TOYOTA'; Model = 'Aygo X' }, @{ Make = 'TOYOTA'; Model = 'bZ4X' }, @{ Make = 'TOYOTA'; Model = 'Corolla Cross' }, @{ Make = 'TOYOTA'; Model = 'Prius+' }, @{ Make = 'TOYOTA'; Model = 'ProAce City' }, @{ Make = 'TOYOTA'; Model = 'ProAce Verso' }, @{ Make = 'TOYOTA'; Model = 'Yaris Cross' },
    @{ Make = 'VOLKSWAGEN'; Model = 'Amarok' }, @{ Make = 'VOLKSWAGEN'; Model = 'Caravelle' }, @{ Make = 'VOLKSWAGEN'; Model = 'CC' }, @{ Make = 'VOLKSWAGEN'; Model = 'Golf Plus' }, @{ Make = 'VOLKSWAGEN'; Model = 'Golf Sportsvan' }, @{ Make = 'VOLKSWAGEN'; Model = 'ID.Buzz' }, @{ Make = 'VOLKSWAGEN'; Model = 'Multivan' }, @{ Make = 'VOLKSWAGEN'; Model = 'Passat CC' }, @{ Make = 'VOLKSWAGEN'; Model = 'Taigo' }
)

function Get-IsPremium {
    param([string]$Make, [string]$Model)

    if ($premiumMakes -contains $Make.ToUpperInvariant()) {
        return $true
    }

    return (In-Set -Set $premiumCategoryKeys -Make $Make -Model $Model)
}

function Get-Category {
    param([string]$Make, [string]$Model, [bool]$IsPremium)

    if (In-Set -Set $electricKeys -Make $Make -Model $Model) {
        return 'el'
    }

    if (In-Set -Set $transporterKeys -Make $Make -Model $Model) {
        return 'transporter'
    }

    if (In-Set -Set $suvKeys -Make $Make -Model $Model) {
        return 'suv'
    }

    if (In-Set -Set $premiumCategoryKeys -Make $Make -Model $Model) {
        return 'premium'
    }

    if ((In-Set -Set $miniSegmentKeys -Make $Make -Model $Model) -or (In-Set -Set $compactSegmentKeys -Make $Make -Model $Model)) {
        return 'small'
    }

    if ($IsPremium -and $Make.ToUpperInvariant() -in @('ASTON MARTIN', 'BENTLEY', 'BUGATTI', 'FERRARI', 'LAMBORGHINI', 'LOTUS', 'MASERATI', 'MCLAREN', 'ROLLS-ROYCE')) {
        return 'premium'
    }

    return 'sedan'
}

function Get-Segment {
    param([string]$Make, [string]$Model, [string]$Category, [bool]$IsPremium)

    if ((In-Set -Set $luxurySegmentKeys -Make $Make -Model $Model) -or $Category -eq 'premium') {
        return 'luxury'
    }

    if (In-Set -Set $miniSegmentKeys -Make $Make -Model $Model) {
        return 'mini'
    }

    if (In-Set -Set $compactSegmentKeys -Make $Make -Model $Model) {
        return 'compact'
    }

    if ((In-Set -Set $fullSizeSegmentKeys -Make $Make -Model $Model) -or $Category -eq 'transporter') {
        return 'full_size'
    }

    return 'mid_size'
}

function Get-FuelType {
    param([string]$Make, [string]$Model, [string]$Category)

    if (In-Set -Set $electricKeys -Make $Make -Model $Model) {
        return 'electric'
    }

    if (In-Set -Set $hybridKeys -Make $Make -Model $Model) {
        return 'hybrid'
    }

    if (In-Set -Set $dieselOnlyKeys -Make $Make -Model $Model) {
        return 'diesel'
    }

    if (In-Set -Set $petrolOnlyKeys -Make $Make -Model $Model) {
        return 'petrol'
    }

    if ($Category -eq 'transporter') {
        return 'diesel'
    }

    if ($Category -eq 'premium') {
        return 'petrol'
    }

    if (In-Set -Set $miniSegmentKeys -Make $Make -Model $Model) {
        return 'petrol'
    }

    return 'diesel_petrol'
}

$existingRows = Import-Csv -Path $vehicleModelsPath
$seen = [System.Collections.Generic.HashSet[string]]::new()
$orderedRows = New-Object System.Collections.Generic.List[object]

foreach ($row in $existingRows) {
    $key = New-Key -Make $row.Make -Model $row.Model
    if (-not $seen.Contains($key)) {
        [void]$seen.Add($key)
        [void]$orderedRows.Add([pscustomobject]@{ Make = $row.Make; Model = $row.Model })
    }
}

foreach ($addition in $additions) {
    $key = New-Key -Make $addition.Make -Model $addition.Model
    if (-not $seen.Contains($key)) {
        [void]$seen.Add($key)
        [void]$orderedRows.Add([pscustomobject]@{ Make = $addition.Make; Model = $addition.Model })
    }
}

$updatedRows = foreach ($row in $orderedRows) {
    $isPremium = Get-IsPremium -Make $row.Make -Model $row.Model
    $category = Get-Category -Make $row.Make -Model $row.Model -IsPremium $isPremium
    $segment = Get-Segment -Make $row.Make -Model $row.Model -Category $category -IsPremium $isPremium
    $fuelType = Get-FuelType -Make $row.Make -Model $row.Model -Category $category

    if ($allowedCategories -notcontains $category) {
        throw "Invalid category '$category' for $($row.Make) $($row.Model)"
    }

    if ($allowedSegments -notcontains $segment) {
        throw "Invalid segment '$segment' for $($row.Make) $($row.Model)"
    }

    if ($allowedFuelTypes -notcontains $fuelType) {
        throw "Invalid fueltype '$fuelType' for $($row.Make) $($row.Model)"
    }

    [pscustomobject]@{
        Make = $row.Make
        Model = $row.Model
        category = $category
        segment = $segment
        fueltype = $fuelType
        isPremium = if ($isPremium) { 1 } else { 0 }
    }
}

$updatedRows | Export-Csv -Path $vehicleModelsPath -NoTypeInformation -Encoding UTF8

Write-Output ('Updated rows=' + $updatedRows.Count)
Write-Output ('Added rows=' + ($updatedRows.Count - $existingRows.Count))