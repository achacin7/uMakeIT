import { Component, OnInit, Input } from '@angular/core';
import { ProductsService } from '../../service/products/products.service';
import * as firebase from 'firebase';
import { Product } from '../../models/product';
import { Plate } from '../../models/plate';
import { Order } from '../../models/order';
import { OrdersService } from 'src/app/service/orders/orders.service';
import { PlatesService } from 'src/app/service/plates/plates.service';

@Component({
	selector: 'app-product-customization',
	templateUrl: './product-customization.component.html',
	styleUrls: ['./product-customization.component.css']
})
export class ProductCustomizationComponent implements OnInit {
	@Input() name: String;
	public product = {} as Product;
	public plate = {} as Plate;
	public order = {} as Order;
	public racion = {} as Plate;
	public aderezo = {} as Plate;
	public jugo = {} as Plate;
	public postre = {} as Plate;
	public raciones = [];
	public aderezos = [];
	public jugos = [];
	public postres = [];
	public productID: any;
	public plato = [];
	public orden = [];
	public references_plates = [];

	constructor(private productsService: ProductsService, private ordersService: OrdersService, private platesService: PlatesService) { }

	agregarPlato() {

		if (this.name != "" && this.plate.cant != null) {

			this.productsService.getProducts().subscribe((productSnapshot) => {
				productSnapshot.forEach((productData: any) => {
					if (productData.payload.doc.data().name === this.name) {
						const reference = productData.payload.doc.id;
						const plato: any = {
							reference_plate: reference,
							cant_plate: this.plate.cant,
							products_plate: this.plato
						}
	
						firebase.firestore().collection('/plates/').add(plato).then((res) => {
							//Aquí estoy verificando el id con el console.log

							
									console.log(res.id);
									/*this.references_plates.push({
										id_plates: res.id
									})*/


							this.ordersService.getOrders().subscribe((orderSnapshot) => {
								var cont = 0;
								var id_order: string;

								orderSnapshot.forEach((orderData: any) => {     
							
								if(orderData.payload.doc.data().reference_user === firebase.auth().currentUser.email){
									if(orderData.payload.doc.data().actual){
										cont++;
										id_order = orderData.payload.doc.id;
									}
								}
								})

								if(cont === 0){
									//plates_r.push(id_plato);
									
									this.references_plates.push({
										id_plates: res.id
									})

									const orden: any = {
										reference_user: firebase.auth().currentUser.email,
										actual: true,
										plates_references: []
									}

									this.ordersService.createOrder(orden);

									const plates_references = res.id;
 									
 									this.ordersService.getOrders().subscribe((actualOrder) => {
 										actualOrder.forEach((actualOrderData: any) => {
 											if(actualOrderData.payload.doc.data().reference_user === firebase.auth().currentUser.email){
												if(actualOrderData.payload.doc.data().actual){
													id_order = actualOrderData.payload.doc.id;
													this.ordersService.getOrder(id_order).update({
														plates_references: firebase.firestore.FieldValue.arrayUnion(plates_references)
													})
												}
											}
 										})
 									})


								}else if(cont === 1){

									const plates_references = res.id;

									this.ordersService.getOrder(id_order).update({
										plates_references: firebase.firestore.FieldValue.arrayUnion(plates_references)
									})

									/*const orden: any = {
										reference_user: firebase.auth().currentUser.email,
										actual: true,
										plates_references: this.references_plates
									}
									this.ordersService.updateOrder(orden, id_order);*/
								}
							})

						});
					}
				})
			})
			
		}
	}

	agregarRacion() {
		if (this.racion.name != "" && this.racion.cant != null) {
			this.productsService.getProducts().subscribe((productSnapshot) => {
				productSnapshot.forEach((productData: any) => {
					if (productData.payload.doc.data().name === this.racion.name) {
						this.plato.push({
							id: productData.payload.doc.id,
							cant: this.racion.cant
						})
						this.racion.cant = null;
						console.log(this.plato);
					}
				})
			})
		}
	}

	agregarAderezo() {
		if (this.aderezo.name != "" && this.aderezo.cant != null) {
			this.productsService.getProducts().subscribe((productSnapshot) => {
				productSnapshot.forEach((productData: any) => {
					if (productData.payload.doc.data().name === this.aderezo.name) {
						this.plato.push({
							id: productData.payload.doc.id,
							cant: this.aderezo.cant
						})
						this.aderezo.cant = null;
						console.log(this.plato);
					}
				})
			})
		}
	}

	agregarJugo() {
		if (this.jugo.name != "" && this.jugo.cant != null) {
			this.productsService.getProducts().subscribe((productSnapshot) => {
				productSnapshot.forEach((productData: any) => {
					if (productData.payload.doc.data().name === this.jugo.name) {
						this.plato.push({
							id: productData.payload.doc.id,
							cant: this.jugo.cant
						})
						this.jugo.cant = null;
						console.log(this.plato);
					}
				})
			})
		}
	}

	agregarPostre() {
		if (this.postre.name != "" && this.postre.cant != null) {
			this.productsService.getProducts().subscribe((productSnapshot) => {
				productSnapshot.forEach((productData: any) => {
					if (productData.payload.doc.data().name === this.postre.name) {
						this.plato.push({
							id: productData.payload.doc.id,
							cant: this.postre.cant
						})
						this.postre.cant = null;
						console.log(this.plato);
					}
				})
			})
		}
	}

	ngOnInit() {
		this.productsService.getProducts().subscribe((productSnapshot) => {
			productSnapshot.forEach((productData: any) => {
				firebase.firestore().collection('/products/').doc(productData.payload.doc.id).onSnapshot((data) => {
					if (data.get('name') === this.name) {
						this.product.name_img = data.get('name_img');
						this.product.name = data.get('name');
						this.product.plato = data.get('plato');
						this.product.price = data.get('price');
						this.product.available = data.get('available');
						this.product.url_img = data.get('url_img');
						this.productID = productData.payload.doc.id;
					}
				})
			})
		})

		this.productsService.getProducts().subscribe((productSnapshot) => {
			productSnapshot.forEach((productData: any) => {
				if (productData.payload.doc.data().plato === "Ración" && productData.payload.doc.data().available === "Disponible") {
					this.raciones.push({
						id: productData.payload.doc.id,
						data: productData.payload.doc.data()
					})
				} else if (productData.payload.doc.data().plato === "Aderezo" && productData.payload.doc.data().available === "Disponible") {
					this.aderezos.push({
						id: productData.payload.doc.id,
						data: productData.payload.doc.data()
					})
				} else if (productData.payload.doc.data().plato === "Jugo" && productData.payload.doc.data().available === "Disponible") {
					this.jugos.push({
						id: productData.payload.doc.id,
						data: productData.payload.doc.data()
					})
				} else if (productData.payload.doc.data().plato === "Postre" && productData.payload.doc.data().available === "Disponible") {
					this.postres.push({
						id: productData.payload.doc.id,
						data: productData.payload.doc.data()
					})
				}

			})
		})
	}

}
