import { faker } from '@faker-js/faker';
import axios from 'axios';

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

const TICK_RATE_MS = 1000 // the higher it is, the more time will elapse between ticks

const PURCHASE_OBJECT_RARITY = 2; // the higher it is, the less items customers will want to buy
const CUSTOMER_SPAWN_RATE = 3; // the higher it is, the fewer customers will enter the store
const CUSTOMER_TIME_AVAILABLE = 10; // the higher it is, the longer (on average) customers will spend in the store

class Customer {
	name;
	purchasesLeft;
	inTheShop;
	timeLeft;

	possiblePurchases = [
		{ product: 'magazine', price: 10 },
		{ product: 'chocolate bar', price: 1 },
		{ product: 'newspaper', price: 2 },
		{ product: 'city map', price: 3 },
		{ product: 'crisps', price: 4 },
		{ product: 'ice cream', price: 7 },
	];

	constructor() {
		this.name = faker.name.firstName();
		this.inTheShop = true;
		this.timeLeft = getRandomInt(CUSTOMER_TIME_AVAILABLE);
		this.purchasesLeft = this.decidePurchases();
	}

	decidePurchases() {
		const decidedPurchases = [];
		this.possiblePurchases.forEach((item) => {
			let roll = getRandomInt(PURCHASE_OBJECT_RARITY);
			if (roll) {
				decidedPurchases.push(item);
			}
		});
		return decidedPurchases;
	}

	tick() {
		if (this.purchasesLeft.length) {
			this.attemptPurchase();
		}

		if (!this.purchasesLeft || !this.timeLeft) {
			this.exit();
		}
		this.timeLeft--;
	}

	attemptPurchase() {
		// axios.get(url)
		console.log(`${this.name} asks for ${this.purchasesLeft[0].product}`);
	}

	exit() {
		this.inTheShop = false;
		console.log(`${this.name} leaves`);
	}
}

async function root() {
	let activeCustomers = [];

	while (true) {
		// tick
		console.log('TICK');
		await new Promise((resolve) => setTimeout(resolve, TICK_RATE_MS));

		activeCustomers.forEach((customer) => customer.tick());
		activeCustomers = activeCustomers.filter((customer) => {
			return customer.inTheShop;
		});

		if (getRandomInt(CUSTOMER_SPAWN_RATE) === 0) {
			const newCustomer = new Customer();
			activeCustomers.push(newCustomer);
			console.log(`${newCustomer.name} entered the shop`);
		}
	}
}

root();
