const API_BASE_URL = "http://localhost/JSlab5/api.php";

class ApiRepository {
  #baseUrl;
  #type;

  constructor(baseUrl, type) {
    this.#baseUrl = baseUrl;
    this.#type = type;
  }

  async readAll() {
    const response = await fetch(`${this.#baseUrl}?type=${this.#type}`);
    if (!response.ok) throw new Error(`Помилка завантаження: ${response.status}`);
    return response.json();
  }

  async readById(id) {
    const response = await fetch(`${this.#baseUrl}?type=${this.#type}&id=${id}`);
    if (!response.ok) throw new Error(`Помилка завантаження: ${response.status}`);
    return response.json();
  }

  async create(item) {
    const response = await fetch(`${this.#baseUrl}?type=${this.#type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error(`Помилка створення: ${response.status}`);
    return response.json();
  }

  async update(id, changes) {
    const response = await fetch(`${this.#baseUrl}?type=${this.#type}&id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    if (!response.ok) throw new Error(`Помилка оновлення: ${response.status}`);
    return response.json();
  }

  async delete(id) {
    const response = await fetch(`${this.#baseUrl}?type=${this.#type}&id=${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(`Помилка видалення: ${response.status}`);
    return response.json();
  }
}

const carsApi = new ApiRepository(API_BASE_URL, "car_tvardovskyi");
const tripsApi = new ApiRepository(API_BASE_URL, "trip_tvardovskyi");
const driversApi = new ApiRepository(API_BASE_URL, "driver_tvardovskyi");

const formatCar = c => `[${c.id}] ${c.brand}, ${c.plate}, ${c.capacity} т, ${c.fuelPer100} л/100 км`;
const formatDriver = d => `[${d.id}] ${d.fullName}, ${d.personnelNumber}, кат. ${d.category}`;
const formatTrip = t =>
  `[${t.id}] ${t.origin} → ${t.destination}, ${t.distance} км, вантаж: ${t.cargo}, ` +
  `авто #${t.carId}, водій #${t.driverId}, статус: ${t.status}`;

async function printAll(title, repo, format) {
  const items = await repo.readAll();
  console.log(`${title} (${items.length}):`);
  for (const item of items) console.log("  " + format(item));
  return items;
}

async function clearAll(repo) {
  for (const item of await repo.readAll()) await repo.delete(item.id);
}

async function demo() {
  try {
    await clearAll(tripsApi);
    await clearAll(carsApi);
    await clearAll(driversApi);

    console.log("Завдання 3. Створення об'єктів на сервері");
    const car1 = await carsApi.create({ plate: "AT 1234 BK", brand: "MAN TGS", capacity: 18, fuelPer100: 32.5 });
    const car2 = await carsApi.create({ plate: "AT 5678 CM", brand: "Volvo FH16", capacity: 25, fuelPer100: 35.0 });
    const car3 = await carsApi.create({ plate: "AT 9012 HP", brand: "Mercedes Atego", capacity: 8, fuelPer100: 21.4 });
    console.log("Створено автомобіль (сервер додав id):", car1);

    const drv1 = await driversApi.create({ fullName: "Твардовський І.", personnelNumber: "TN-1015", category: "C, CE" });
    const drv2 = await driversApi.create({ fullName: "Ковальчук І.", personnelNumber: "TN-1022", category: "C" });
    const drv3 = await driversApi.create({ fullName: "Бойко Олег Васильович", personnelNumber: "TN-1037", category: "B, C, CE" });
    console.log("Створено водія:", drv1);

    const trip1 = await tripsApi.create({ carId: car1.id, driverId: drv1.id, departureDate: "2026-03-02", returnDate: "2026-03-04",
      distance: 610, origin: "Івано-Франківськ", destination: "Київ", cargo: "Будматеріали", status: "завершено" });
    await tripsApi.create({ carId: car2.id, driverId: drv1.id, departureDate: "2026-03-10", returnDate: "2026-03-12",
      distance: 780, origin: "Івано-Франківськ", destination: "Одеса", cargo: "Продукти", status: "завершено" });
    const trip3 = await tripsApi.create({ carId: car1.id, driverId: drv2.id, departureDate: "2026-03-15", returnDate: "2026-03-16",
      distance: 140, origin: "Івано-Франківськ", destination: "Львів", cargo: "Меблі", status: "в дорозі" });
    const trip4 = await tripsApi.create({ carId: car3.id, driverId: drv3.id, departureDate: "2026-03-18", returnDate: "2026-03-18",
      distance: 95, origin: "Івано-Франківськ", destination: "Тернопіль", cargo: "Техніка", status: "заплановано" });
    console.log("Створено рейс:", trip1);

    console.log("\nДані, отримані з сервера методом readAll():");
    await printAll("Автомобілі", carsApi, formatCar);
    await printAll("Водії", driversApi, formatDriver);
    await printAll("Рейси", tripsApi, formatTrip);

    console.log("\nЗавдання 4. Update і Delete");
    const updatedCar = await carsApi.update(car2.id, { fuelPer100: 33.9 });
    console.log("Оновлено автомобіль:", formatCar(updatedCar));
    const updatedDriver = await driversApi.update(drv2.id, { category: "C, CE" });
    console.log("Оновлено водія:", formatDriver(updatedDriver));
    const updatedTrip = await tripsApi.update(trip3.id, { status: "завершено" });
    console.log("Оновлено рейс:", formatTrip(updatedTrip));

    await tripsApi.delete(trip4.id);
    console.log(`Видалено рейс id = ${trip4.id}`);
    await carsApi.delete(car3.id);
    console.log(`Видалено автомобіль id = ${car3.id}`);
    await driversApi.delete(drv3.id);
    console.log(`Видалено водія id = ${drv3.id}`);

    console.log("\nСтан після Update/Delete:");
    await printAll("Автомобілі", carsApi, formatCar);
    await printAll("Водії", driversApi, formatDriver);
    await printAll("Рейси", tripsApi, formatTrip);

    console.log("\nЗавдання 5. Зв'язок «багато до багатьох» (дані з сервера)");
    const [cars, drivers, trips] = await Promise.all([
      carsApi.readAll(), driversApi.readAll(), tripsApi.readAll(),
    ]);

    for (const driver of drivers) {
      const driverTrips = trips.filter(t => t.driverId === driver.id);
      if (driverTrips.length >= 2) {
        console.log(`Водій ${driver.fullName} виконав ${driverTrips.length} рейси на різних автомобілях:`);
        for (const t of driverTrips) {
          const car = cars.find(c => c.id === t.carId);
          console.log(`  - рейс #${t.id}: ${car.brand} (${car.plate}), ${t.origin} → ${t.destination}`);
        }
      }
    }
    for (const car of cars) {
      const carTrips = trips.filter(t => t.carId === car.id);
      if (carTrips.length >= 2) {
        console.log(`Автомобіль ${car.brand} (${car.plate}) використовували різні водії:`);
        for (const t of carTrips) {
          const driver = drivers.find(d => d.id === t.driverId);
          console.log(`  - рейс #${t.id}: ${driver.fullName}, статус: ${t.status}`);
        }
      }
    }
  } catch (error) {
    console.log("Помилка:", error.message);
  }
}

demo();
