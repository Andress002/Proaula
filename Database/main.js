require('dotenv').config();
const { faker } = require('@faker-js/faker');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const fs = require('fs');

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "MYSECRETPASSWORD",
    port: 5432,
});

// ===================== SEED DATA =====================

const usersData = [
  { name: 'Carlos', last_name: 'Martínez', email: 'carlos.admin@proaula.com', password: 'Admin123!', rol: 'admin', type_document: 'CC', number_document: '1001234567', phone: '3101234567', country: 'Colombia', city: 'Bogotá', has_premium_service: true, has_vip_service: false },
  { name: 'María', last_name: 'López', email: 'maria.admin@proaula.com', password: 'Admin123!', rol: 'admin', type_document: 'CC', number_document: '1009876543', phone: '3209876543', country: 'Colombia', city: 'Medellín', has_premium_service: true, has_vip_service: true },
  { name: 'Pedro', last_name: 'Sánchez', email: 'pedro.admin@proaula.com', password: 'Admin123!', rol: 'admin', type_document: 'PP', number_document: 'AB1234567', phone: '3154443322', country: 'España', city: 'Madrid', has_premium_service: true, has_vip_service: true },
  { name: 'Ana María', last_name: 'Gómez', email: 'anamaria.admin@proaula.com', password: 'Admin123!', rol: 'admin', type_document: 'CC', number_document: '1004567890', phone: '3014567890', country: 'Colombia', city: 'Cali', has_premium_service: true, has_vip_service: false },
  { name: 'Luis Fernando', last_name: 'Rodríguez', email: 'luis.admin@proaula.com', password: 'Admin123!', rol: 'admin', type_document: 'CC', number_document: '1005678901', phone: '3025678901', country: 'México', city: 'Ciudad de México', has_premium_service: false, has_vip_service: false },
  { name: 'Andrés', last_name: 'García', email: 'andres.user@proaula.com', password: 'User1234!', rol: 'user', type_document: 'CC', number_document: '1005551234', phone: '3115551234', country: 'Colombia', city: 'Cali', has_premium_service: false, has_vip_service: false },
  { name: 'Laura', last_name: 'Rodríguez', email: 'laura.user@proaula.com', password: 'User1234!', rol: 'user', type_document: 'TI', number_document: '1007778899', phone: '3007778899', country: 'Colombia', city: 'Barranquilla', has_premium_service: false, has_vip_service: false },
  { name: 'Carlos Eduardo', last_name: 'Mendoza', email: 'carlos.user@proaula.com', password: 'User1234!', rol: 'user', type_document: 'CC', number_document: '1008889900', phone: '3128889900', country: 'Colombia', city: 'Cartagena', has_premium_service: false, has_vip_service: false },
];

const hotelsData = [
  { name: 'Hotel Dorado Plaza', description: 'Lujoso hotel de 5 estrellas ubicado en el corazón de Bogotá, con vistas panorámicas a los cerros orientales.', type_accomodation: 'hotel', country: 'Colombia', city: 'Bogotá', address: 'Calle 100 #19-61', phone: '6011234567', email: 'reservas@doradoplaza.com' },
  { name: 'Hostel La Candelaria', description: 'Acogedor hostal en el barrio histórico de La Candelaria, ideal para viajeros y mochileros.', type_accomodation: 'hostel', country: 'Colombia', city: 'Bogotá', address: 'Carrera 3 #12-45', phone: '6019876543', email: 'info@hostelcandelaria.com' },
  { name: 'Medellín Grand Hotel', description: 'Hotel moderno en El Poblado con piscina infinity, spa y restaurante gourmet.', type_accomodation: 'hotel', country: 'Colombia', city: 'Medellín', address: 'Calle 10 #43D-36, El Poblado', phone: '6044567890', email: 'contacto@medellingrand.com' },
  { name: 'Airbnb Villa del Mar', description: 'Hermosa villa frente al mar en Cartagena con 4 habitaciones, cocina equipada y jardín tropical.', type_accomodation: 'airbnb', country: 'Colombia', city: 'Cartagena', address: 'Bocagrande, Av. San Martín #8-42', phone: '6056781234', email: 'villa@airbnbcartagena.com' },
  { name: 'Motel Las Palmas', description: 'Cómodo motel de carretera con todas las comodidades para el viajero, ubicado en la vía Cali-Palmira.', type_accomodation: 'motel', country: 'Colombia', city: 'Cali', address: 'Km 5 Vía Cali-Palmira', phone: '6023456789', email: 'reservas@motellaspalmas.com' },
  { name: 'Hotel Santa Cruz', description: 'Elegante hotel boutique en el centro histórico de Santa Marta con terraza al mar.', type_accomodation: 'hotel', country: 'Colombia', city: 'Santa Marta', address: 'Calle 18 #3-15, Centro Histórico', phone: '6057891234', email: 'info@hotelsantacruz.com' },
  { name: 'Hotel Valle Verde', description: 'Hotel campestre en el Valle del Cauca con piscina al aire libre y áreas verdes.', type_accomodation: 'hotel', country: 'Colombia', city: 'Pereira', address: 'Km 8 Vía Pereira - Armenia', phone: '6061234567', email: 'reservas@hotelvalleverde.com' },
  { name: 'Posada Colonial Casa Blanca', description: 'Casa colonial restaurada en el centro de Barichara, Santander.', type_accomodation: 'hostel', country: 'Colombia', city: 'Barichara', address: 'Calle 5 #4-25', phone: '6079876543', email: 'info@posadacolonial.com' },
  { name: 'Hotel Playa Mar', description: 'Hotel frente a la playa en San Andrés con vista al mar Caribe.', type_accomodation: 'hotel', country: 'Colombia', city: 'San Andrés', address: 'Av. Colon #3-45', phone: '6081234567', email: 'reservas@hotelplayamar.com' },
  { name: 'Eco Lodge Montaña', description: 'Ecolodge en las montañas de Antioquia con senderos y naturaleza.', type_accomodation: 'hostel', country: 'Colombia', city: 'Jardín', address: 'Vereda La Argentina', phone: '6049876543', email: 'info@ecolodemontana.com' },
];

const clientsData = [
  { name: 'Juan', last_name: 'Pérez', email: 'juan.perez@gmail.com', phone: '3121234567', password: 'Client123!', country: 'Colombia', rol: 'user', type_document: 'CC', number_document: '1021234567', birth_date: '1990-05-15' },
  { name: 'Ana', last_name: 'Gómez', email: 'ana.gomez@gmail.com', phone: '3139876543', password: 'Client123!', country: 'Colombia', rol: 'user', type_document: 'CC', number_document: '1039876543', birth_date: '1988-11-22' },
  { name: 'Roberto', last_name: 'Hernández', email: 'roberto.hernandez@hotmail.com', phone: '3145556677', password: 'Client123!', country: 'Colombia', rol: 'user', type_document: 'CC', number_document: '1045556677', birth_date: '1995-03-10' },
  { name: 'Carolina', last_name: 'Díaz', email: 'carolina.diaz@yahoo.com', phone: '3008889900', password: 'Client123!', country: 'Colombia', rol: 'user', type_document: 'TI', number_document: '1058889900', birth_date: '2000-07-28' },
  { name: 'Miguel', last_name: 'Torres', email: 'miguel.torres@outlook.com', phone: '3162223344', password: 'Client123!', country: 'Colombia', rol: 'user', type_document: 'PP', number_document: 'PA1234567', birth_date: '1985-12-03' },
  { name: 'Valentina', last_name: 'Morales', email: 'valentina.morales@gmail.com', phone: '3183334455', password: 'Client123!', country: 'Colombia', rol: 'user', type_document: 'CC', number_document: '1063334455', birth_date: '1997-09-18' },
  { name: 'Santiago', last_name: 'Ramírez', email: 'santiago.ramirez@gmail.com', phone: '3194445566', password: 'Client123!', country: 'Colombia', rol: 'user', type_document: 'CC', number_document: '1074445566', birth_date: '1992-01-25' },
  { name: 'Isabella', last_name: 'Vargas', email: 'isabella.vargas@gmail.com', phone: '3205556677', password: 'Client123!', country: 'Colombia', rol: 'user', type_document: 'TE', number_document: 'TE7890123', birth_date: '1993-06-14' },
];

const roomsData = [
  { name: 'Suite Presidencial', description: 'Suite de lujo con sala de estar, jacuzzi privado y vista panorámica a la ciudad.', price: 850000, status: 'free', ability: '2', hotelIndex: 0 },
  { name: 'Habitación Deluxe', description: 'Habitación amplia con cama king, minibar y baño de mármol.', price: 450000, status: 'free', ability: '2', hotelIndex: 0 },
  { name: 'Habitación Estándar', description: 'Habitación cómoda con cama doble, escritorio y WiFi de alta velocidad.', price: 250000, status: 'free', ability: '2', hotelIndex: 0 },
  { name: 'Dormitorio Compartido 6 Camas', description: 'Dormitorio compartido con 6 camas tipo litera, casilleros individuales y baño compartido.', price: 45000, status: 'free', ability: '6', hotelIndex: 1 },
  { name: 'Habitación Privada Doble', description: 'Habitación privada con cama doble, baño privado y vista al patio interior.', price: 120000, status: 'free', ability: '2', hotelIndex: 1 },
  { name: 'Junior Suite', description: 'Suite moderna con zona de estar, balcón con vista a la piscina y minibar premium.', price: 520000, status: 'free', ability: '2', hotelIndex: 2 },
  { name: 'Habitación Superior', description: 'Habitación con cama queen, acceso al spa y desayuno incluido.', price: 380000, status: 'booked', ability: '2', hotelIndex: 2 },
  { name: 'Habitación Familiar', description: 'Amplia habitación con 2 camas dobles, ideal para familias con niños.', price: 420000, status: 'free', ability: '4', hotelIndex: 2 },
  { name: 'Master Suite Oceánica', description: 'Suite principal con cama king, vestidor, baño de lujo y balcón con vista al mar.', price: 680000, status: 'free', ability: '2', hotelIndex: 3 },
  { name: 'Habitación Tropical', description: 'Habitación decorada con estilo caribeño, cama doble y ventanas al jardín.', price: 350000, status: 'busy', ability: '2', hotelIndex: 3 },
  { name: 'Habitación Confort', description: 'Habitación equipada con TV cable, aire acondicionado y estacionamiento privado.', price: 95000, status: 'free', ability: '2', hotelIndex: 4 },
  { name: 'Suite Colonial', description: 'Suite decorada con estilo colonial, balcón con vista al mar Caribe y bañera antigua.', price: 600000, status: 'free', ability: '2', hotelIndex: 5 },
  { name: 'Habitación Estándar Marina', description: 'Habitación sencilla con cama doble y terraza compartida con vista al puerto.', price: 200000, status: 'free', ability: '2', hotelIndex: 5 },
  { name: 'Cabaña Familiar', description: 'Cabaña de madera con cocina, chimenea y vista al jardín.', price: 350000, status: 'free', ability: '4', hotelIndex: 6 },
  { name: 'Habitación Vista Montaña', description: 'Habitación con balcón y vista a las montañas.', price: 180000, status: 'booked', ability: '2', hotelIndex: 6 },
  { name: 'Suite Jacuzzi', description: 'Suite con jacuzzi privado y acceso a la piscina.', price: 450000, status: 'free', ability: '2', hotelIndex: 6 },
  { name: 'Habitación Patió Central', description: 'Habitación tradicional con acceso al patio central.', price: 120000, status: 'busy', ability: '2', hotelIndex: 7 },
  { name: 'Suite Torreón', description: 'Suite en la torre con vista panoramic del pueblo.', price: 220000, status: 'free', ability: '2', hotelIndex: 7 },
  { name: 'Habitación Balcón Caribe', description: 'Habitación con balcón privado y vista al mar.', price: 400000, status: 'free', ability: '2', hotelIndex: 8 },
  { name: 'Suite Sunset', description: 'Suite de lujo con jacuzzi y vista al atardecer.', price: 650000, status: 'booked', ability: '2', hotelIndex: 8 },
  { name: 'Habitación Familiar Playa', description: 'Habitación grande para familia con cocina básica.', price: 350000, status: 'free', ability: '4', hotelIndex: 8 },
  { name: 'Habitación Nido', description: 'Habitación elevada en los árboles con Hamacas.', price: 150000, status: 'free', ability: '2', hotelIndex: 9 },
  { name: 'Cabaña Río', description: 'Cabaña junto al río con privacidad total.', price: 280000, status: 'free', ability: '4', hotelIndex: 9 },
];

const adminHotelsData = [
  { userIndex: 0, hotelIndex: 0 },
  { userIndex: 0, hotelIndex: 1 },
  { userIndex: 1, hotelIndex: 2 },
  { userIndex: 1, hotelIndex: 3 },
  { userIndex: 2, hotelIndex: 4 },
  { userIndex: 2, hotelIndex: 5 },
  { userIndex: 3, hotelIndex: 6 },
  { userIndex: 3, hotelIndex: 7 },
  { userIndex: 4, hotelIndex: 8 },
  { userIndex: 4, hotelIndex: 9 },
];

const paymentsServicesData = [
  { name: 'PREMIUN', description: 'Plan Premium con acceso a reportes avanzados, notificaciones en tiempo real y soporte prioritario.', price: 150000, active: true, userIndex: 0 },
  { name: 'VIP', description: 'Plan VIP con todas las funciones Premium más integración API, dashboard personalizado y asesor dedicado.', price: 300000, active: true, userIndex: 1 },
  { name: 'BASIC', description: 'Plan Básico con acceso limitado a funcionalidades esenciales de gestión hotelera.', price: 50000, active: false, userIndex: 2 },
  { name: 'PREMIUN', description: 'Plan Premium renovado con mejoras en la interfaz y nuevas métricas de rendimiento.', price: 150000, active: true, userIndex: 4 },
  { name: 'PREMIUN', description: 'Plan Premium Hotel Valle Verde', price: 150000, active: true, userIndex: 3 },
  { name: 'VIP', description: 'Plan VIP Hotel Playa Mar', price: 300000, active: true, userIndex: 4 },
  { name: 'PREMIUN', description: 'Plan Premium Hotel Santa Cruz', price: 150000, active: true, userIndex: 2 },
  { name: 'VIP', description: 'Plan VIP Hotel Dorado Plaza', price: 300000, active: true, userIndex: 0 },
];

const seasonality = [1.2, 0.9, 1.0, 1.1, 1.0, 1.3, 1.3, 1.0, 0.9, 1.0, 1.0, 1.5];
//                    Ene  Feb  Mar  Abr  May  Jun  Jul  Ago  Sep  Oct  Nov  Dic

// ===================== INSERT LOGIC =====================

async function insertData() {
    try {
        fs.writeFileSync('passwords.txt', '');
        faker.seed(12345);

        await pool.query('TRUNCATE TABLE "payment_reservation", "reservation", "room", "admin_hotels", "hotel", "payment_services", "client", "user" CASCADE');

        const userIds = [], hotelIds = [], clientIds = [], roomIds = [], reservationIds = [];

        // ---- USERS ----
        console.log('Creando usuarios...');
        for (const data of usersData) {
            const hashed = await bcrypt.hash(data.password, 10);
            const res = await pool.query(`
                INSERT INTO "user" (name, last_name, email, password, rol, type_document, number_document, phone, country, city, has_premium_service, has_vip_service)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
                [data.name, data.last_name, data.email, hashed, data.rol, data.type_document, data.number_document, data.phone, data.country, data.city, data.has_premium_service, data.has_vip_service]);
            userIds.push(res.rows[0].id);
            fs.appendFileSync('passwords.txt', `${data.rol === 'admin' ? 'Admin' : 'User'} | Email: ${data.email} | Contraseña: ${data.password}\n`);
        }
        console.log(`  ${userIds.length} usuarios creados`);

        // ---- HOTELS ----
        console.log('Creando hoteles...');
        for (const data of hotelsData) {
            const res = await pool.query(`
                INSERT INTO "hotel" (name, description, type_accomodation, country, city, address, phone, email)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
                [data.name, data.description, data.type_accomodation, data.country, data.city, data.address, data.phone, data.email]);
            hotelIds.push(res.rows[0].id);
        }
        console.log(`  ${hotelIds.length} hoteles creados`);

        // ---- CLIENTS ----
        console.log('Creando clientes...');
        for (const data of clientsData) {
            const hashed = await bcrypt.hash(data.password, 10);
            const res = await pool.query(`
                INSERT INTO "client" (name, last_name, email, phone, password, rol, country, type_document, number_document, birth_date)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
                [data.name, data.last_name, data.email, data.phone, hashed, data.rol, data.country, data.type_document, data.number_document, data.birth_date]);
            clientIds.push(res.rows[0].id);
            fs.appendFileSync('passwords.txt', `Cliente | Email: ${data.email} | Contraseña: ${data.password}\n`);
        }
        console.log(`  ${clientIds.length} clientes creados`);

        // ---- ROOMS ----
        console.log('Creando habitaciones...');
        const roomPrices = {};
        for (const data of roomsData) {
            const hotelId = hotelIds[data.hotelIndex];
            const res = await pool.query(`
                INSERT INTO "room" (name, description, price, status, ability, hotel_id)
                VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
                [data.name, data.description, data.price, data.status, data.ability, hotelId]);
            roomIds.push(res.rows[0].id);
            roomPrices[res.rows[0].id] = data.price;
        }
        console.log(`  ${roomIds.length} habitaciones creadas`);

        // ---- ADMIN-HOTELS ----
        console.log('Creando asociaciones admin-hoteles...');
        for (const data of adminHotelsData) {
            await pool.query(`INSERT INTO "admin_hotels" (user_id, hotel_id) VALUES ($1, $2)`,
                [userIds[data.userIndex], hotelIds[data.hotelIndex]]);
        }
        console.log(`  ${adminHotelsData.length} asociaciones creadas`);

        // ---- BULK RESERVATIONS ----
        console.log('Generando reservas masivas...');
        let createdCount = 0;
        for (let i = 0; i < 10000; i++) {
            const roomId = faker.helpers.arrayElement(roomIds);
            const clientId = faker.helpers.arrayElement(clientIds);
            const roomPrice = roomPrices[roomId];

            const isHistorical = Math.random() < 0.7;
            let checkIn;

            if (isHistorical) {
                const monthWeights = Array.from({ length: 12 }, (_, j) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - j);
                    return seasonality[d.getMonth()];
                });
                const totalWeight = monthWeights.reduce((a, b) => a + b, 0);
                let r = Math.random() * totalWeight;
                let selectedIdx = 0;
                for (let j = 0; j < 12; j++) {
                    r -= monthWeights[j];
                    if (r <= 0) { selectedIdx = j; break; }
                }
                const targetMonth = new Date();
                targetMonth.setMonth(targetMonth.getMonth() - selectedIdx);
                const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
                const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
                checkIn = faker.date.between({ from: monthStart, to: monthEnd });
            } else {
                checkIn = faker.date.future({ days: 180 });
            }

            const nights = faker.number.int({ min: 1, max: 14 });
            const checkOut = new Date(checkIn);
            checkOut.setDate(checkOut.getDate() + nights);

            const createdAt = isHistorical
                ? faker.date.between({ from: new Date(checkIn.getTime() - 30 * 24 * 60 * 60 * 1000), to: checkIn })
                : faker.date.past({ years: 1 });
            const updatedAt = faker.date.between({ from: createdAt, to: checkOut });

            const availabilityCheck = await pool.query(`
                SELECT COUNT(*) AS count FROM "reservation"
                WHERE room_id = $1 AND ($2 < check_out AND $3 > check_in)`,
                [roomId, checkIn, checkOut]);

            if (parseInt(availabilityCheck.rows[0].count) === 0) {
                const res = await pool.query(`
                    INSERT INTO "reservation" (room_id, client_id, status, check_in, check_out, created_at, updated_at)
                    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
                    [
                        roomId,
                        clientId,
                        isHistorical ? 'confirmed' : faker.helpers.arrayElement(['confirmed', 'canceled', 'refunded']),
                        checkIn,
                        checkOut,
                        createdAt,
                        updatedAt
                    ]);
                reservationIds.push({ id: res.rows[0].id, clientId, roomId, createdAt, updatedAt, checkIn, checkOut, roomPrice });

                await pool.query(`UPDATE "room" SET status = 'booked' WHERE id = $1`, [roomId]);
                createdCount++;
            }
        }
        console.log(`  ${createdCount} reservas creadas (${reservationIds.length} exitosas)`);

        // ---- PAYMENT RESERVATIONS ----
        console.log('Creando pagos de reservas...');
        let paymentCount = 0;
        for (const reservation of reservationIds) {
            const isHistorical = reservation.checkIn < new Date();
            const paymentStatus = isHistorical ? 'confirmed' : faker.helpers.arrayElement(['pending', 'confirmed', 'canceled', 'refunded']);
            const nights = Math.ceil((reservation.checkOut - reservation.checkIn) / (1000 * 60 * 60 * 24));
            const amount = Math.round(reservation.roomPrice * nights * faker.number.float({ min: 0.85, max: 1.15 }));

            await pool.query(`
                INSERT INTO "payment_reservation" (payment_date, status, amount, payment_method, reservation_id, client_id, room_id, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    isHistorical ? reservation.checkIn : reservation.updatedAt,
                    paymentStatus,
                    amount,
                    faker.helpers.arrayElement(['visa', 'mastercard', 'paypal', 'other']),
                    reservation.id,
                    reservation.clientId,
                    reservation.roomId,
                    reservation.createdAt,
                    reservation.updatedAt
                ]);

            if (paymentStatus === 'confirmed') {
                await pool.query(`UPDATE "room" SET status = 'busy' WHERE id = $1`, [reservation.roomId]);
            }
            paymentCount++;
        }
        console.log(`  ${paymentCount} pagos de reservas creados`);

        // ---- SUBSCRIPTION PAYMENTS (PREMIUM/VIP/BASIC) ----
        console.log('Creando pagos de servicios...');
        const now = new Date();
        for (const data of paymentsServicesData) {
            await pool.query(`
                INSERT INTO "payment_services" (name, description, price, active, created_at, updated_at, "userId")
                VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                [data.name, data.description, data.price, data.active, now, now, userIds[data.userIndex]]);
        }
        console.log(`  ${paymentsServicesData.length} pagos de servicios creados`);

        console.log('✅ Datos generados correctamente');
        console.log(`\nResumen:`);
        console.log(`  Usuarios: ${userIds.length}`);
        console.log(`  Hoteles: ${hotelIds.length}`);
        console.log(`  Clientes: ${clientIds.length}`);
        console.log(`  Habitaciones: ${roomIds.length}`);
        console.log(`  Admin-Hoteles: ${adminHotelsData.length}`);
        console.log(`  Reservas: ${reservationIds.length}`);
        console.log(`  Pagos de reservas: ${paymentCount}`);
        console.log(`  Pagos de servicios: ${paymentsServicesData.length}`);
        console.log(`\nCredenciales guardadas en passwords.txt`);

    } catch (error) {
        console.error('❌ Error generando datos:', error);
    }
}

insertData();
