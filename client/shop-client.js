import { faker } from '@faker-js/faker';
import { shuffle } from './utils/array.js';
import axios from 'axios';

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

const TICK_RATE_MS = 1000; // the higher it is, the more time will elapse between ticks

const PURCHASE_OBJECT_RARITY = 4; // the higher it is, the less items customers will want to buy
const CUSTOMER_SPAWN_RATE = 10; // the higher it is, the fewer customers will enter the store
const CUSTOMER_TIME_AVAILABLE = 10; // the higher it is, the longer (on average) customers will spend in the store

class Customer {
	name;
	purchasesLeft;
	inTheShop;
	timeLeft;

	possiblePurchases = ['magazine', 'chocolate bar', 'newspaper', 'crisps', 'ice cream'];

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
			if (!roll) {
				const amount = getRandomInt(2) + 1; //todo
				const acceptablePrice = getRandomInt(19) + 1; //todo
				decidedPurchases.push({ item, acceptablePrice, amount });
			}
		});
		shuffle(decidedPurchases);
		return decidedPurchases;
	}

	tick() {
		if (!this.purchasesLeft.length) {
			this.exit('finished with their purchases');
			return;
		}

		if (!this.timeLeft) {
			this.exit('ran out of time');
			return;
		}

		if (this.purchasesLeft.length) {
			this.attemptPurchase();
		}

		this.timeLeft--;
	}

	async attemptPurchase() {
		const attemptedProductPurchase = this.purchasesLeft[0];

		const { data } = await axios.get(`http://localhost:3000/ask/${attemptedProductPurchase.item}`);

		console.log(
			`${this.name} asks about ${attemptedProductPurchase.item}. He is told there are ${data.stock} left and that the price is ${data.price}`
		);

		if (data.stock > 0) {
			if (data.price <= attemptedProductPurchase.acceptablePrice) {
				const response = await axios.put('http://localhost:3000/buy', attemptedProductPurchase);
				console.log(
					`${this.name} buys ${this.purchasesLeft[0].amount}x ${this.purchasesLeft[0].item} for ${data.price}`
				);
			} else {
				console.log(`${this.name} found ${attemptedProductPurchase.item} too expensive.`);
			}
		}

		this.purchasesLeft.shift();
	}

	exit(reason) {
		this.inTheShop = false;
		console.log(`${this.name} leaves - ${reason}`);
	}
}

async function root() {
	let activeCustomers = [];

	while (true) {
		console.log('TICK');
		await new Promise((resolve) => setTimeout(resolve, TICK_RATE_MS));

		activeCustomers.forEach((customer) => customer.tick());
		activeCustomers = activeCustomers.filter((customer) => {
			return customer.inTheShop;
		});

		if (getRandomInt(CUSTOMER_SPAWN_RATE) === 0) {
			const newCustomer = new Customer();
			activeCustomers.push(newCustomer);

			//debug
			const needs = newCustomer.purchasesLeft.map(function (item) {
				return item['item'];
			});

			console.log(`${newCustomer.name} entered the shop, needs to buy ${needs}`);
		}
	}
}

root();
