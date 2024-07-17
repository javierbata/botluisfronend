<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import config from '../config.js';
const toast = useToast();

const products = ref(null);


const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const productBackup= ref({});


const selectionModeClientID = ref(null);
const selectedProducts = ref(null);
const dt = ref(null);
const filters = ref({});
const categoryGlobal = ref([]);
const submitted = ref(false);

const selectedCategory = ref(null); // Variable para almacenar las categorías seleccionadas
const selectedCampaign = ref(null); // Variable para almacenar las categorías seleccionadas

const campaignGlobal = ref([]);
const backupCampaignGlobal = ref([]);
const copiedOptions = ref([]);
const copiedOptionsCampaign = ref([]);
const selectedOptions = ref([]);
const selectedOptionsCampaign = ref([]);


onBeforeMount(() => {
    initFilters();
    initCategory();
    initCampaign();

});
onMounted(async () => {

    products.value = [{ nombre: "javier" }]

    
    console.log(products.value)

    products.value = await getDataClient();
    productBackup.value = products.value;
    //products.value[0].name =products.value[0].Nombre
    console.log(products.value)

});


const formatPhoneNumber = (phoneNumber) => {
    // Formatear el número de teléfono según el formato deseado}

    let countryCode, areaCode, firstPart, secondPart
    try {
        if (phoneNumber.substring(0, 1) == "1") {
            countryCode = "+" + phoneNumber.substring(0, 1);
            areaCode = phoneNumber.substring(1, 4);
            firstPart = phoneNumber.substring(4, 7);
            secondPart = phoneNumber.substring(7, 14);
        } else {
            countryCode = "+" + phoneNumber.substring(0, 2);
            areaCode = phoneNumber.substring(2, 5);
            firstPart = phoneNumber.substring(5, 8);
            secondPart = phoneNumber.substring(8, 14);
        }

        return `${countryCode} ${areaCode}-${firstPart}-${secondPart}`;
    } catch (error) {
        return phoneNumber
    }
}

let today = new Date();
let month = today.getMonth();
let year = today.getFullYear();
let prevMonth = (month === 0) ? 11 : month -1;
let prevYear = (prevMonth === 11) ? year - 1 : year;
let nextMonth = (month === 11) ? 0 : month + 1;
let nextYear = (nextMonth === 0) ? year + 1 : year;

const date = ref();
const minDate = ref(new Date());
const maxDate = ref(new Date());

minDate.value.setMonth(prevMonth);
minDate.value.setFullYear(prevYear);
maxDate.value.setMonth(nextMonth);
maxDate.value.setFullYear(nextYear);

const getDataClient = async () => {

    try {
        let data
        // Realiza la solicitud para obtener los datos de los clientes con las campañas
        const responseClient = await axios.get(config.URLBACKEND + "/campaign/all/client");
        data = responseClient.data.result;

        // Realiza la solicitud para obtener todas las campañas
        const responseCampaign = await axios.get(config.URLBACKEND + "/campaign/all");
        const campaign = responseCampaign.data.result;

        const responseCategory = await axios.get(config.URLBACKEND + "/category/all");
        const category = responseCategory.data.result;



        // Asigna las categorías a cada cliente en el objeto de datos
        data.forEach(client => {
            client.CategoryAndCampaign = [];
            let i = 0;
            if (client.CampaignID && client.CampaignID.length > 0) {


                client.CampaignID.forEach(itemCampaignClient => {
                       //console.log(campaignClient)


                    campaign.forEach(itemCampaign => {
                       //   console.log(campaignClient +" y " +itemCampaign.CampaingID)


                        if (parseInt(itemCampaignClient) == parseInt(itemCampaign.CampaignID)) {

                             //  console.log(campaign +" y4 " + categorias)
                            category.forEach(itemCategory => {

                            //      console.log(itemCampaign.CategoryID +" y2 " +itemCategory.CategoryID)
                                if (parseInt(itemCampaign.CategoryID) == parseInt(itemCategory.CategoryID)) {
                                    if (client.CampaignClientComment[i] === "null") {
                                        client.CampaignClientComment[i] = ""
                                    }

                                    client.CategoryAndCampaign.push({

                                        CategoryID: itemCategory.CategoryID,
                                        CategoryName: itemCategory.CategoryName,
                                        CampaignID: itemCampaign.CampaignID,
                                        CampaignName: itemCampaign.CampaignName,
                                        CampaignClientID: parseInt(client.CampaignClientID[i]),
                                        CampaignClientComment: client.CampaignClientComment[i]
                                    })

                                    i++;
                                }

                            })
                        }
                    })
                })
            }

            if (client.CampaignID && client.CampaignID.length > 0) {
                //   cliente.CampañaNombre = cliente.CampañaID.join(', '); // Puedes mostrar los IDs o los nombres de las campañas
                client.CategoryName = client.CampaignID.map(id => category[campaign[id]]).join(', ');
            } else {
                //   cliente.CampañaNombre = ''; // Si no hay campañas, asigna una cadena vacía
                client.CategoryName = ''; // Si no hay campañas, asigna una cadena vacía
            }
        });

        campaign.forEach(campaign => {
            campaign[campaign.ID] = campaign.CampaignName;
        });

        data.forEach(client => {
            if (client.CampaignID && client.CampaignID.length > 0) {
                client.CampaignName = client.CampaignID.map(id => campaign[id]).join(', ');
            } else {
                client.CampaignName = ''; // Si no hay campañas, asigna una cadena vacía
            }

        });

        return data


    } catch (error) {
        console.error('Error al obtener los datos de los clientes:', error);
    }
}

const openNew = () => {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
};

const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};

const validateName = (name) => {
    const validCharacters = /^[a-zA-Z\s]+$/; // Solo permite letras y espacios en blanco

    if (!validCharacters.test(name)) {
        return false; // Si contiene caracteres no válidos, devuelve false
    }

    return true; // Si no contiene caracteres no válidos, devuelve true
}

// Función para validar un número
const validateNumber = (number) => {
    const validCharacters = /^[0-9]+$/; // Solo permite dígitos

    if (!validCharacters.test(number)) {
        return false; // Si contiene caracteres no válidos, devuelve false
    }

    return true; // Si no contiene caracteres no válidos, devuelve true
}


const saveProduct = async (Selections) => {

    let validator = true;
    let codeError;
    let messageError = "";
    let arrayTempUpdateOptions = []
    let arrayTempNewOptions = []

    products.value.forEach(item => {

        if (product.value.ClientID == item.ClientID) {

            if (item.ClientName != product.value.ClientName) {
                if (validateName(product.value.ClientName)) {
                    console.log("Caracteres validos" + product.value.ClientName)
                } else {
                    console.log("caracteres no validos" + product.value.ClientName)

                }
            } else {
                console.log("No requiere ser modificado")
            }
        }


    })



    Selections.forEach(item => {

        let i = false
        product.value.CategoryAndCampaign.forEach(itemProduct => {
            let update = false;
            if (itemProduct.CampaignID == item.CampaignID) {
                if (item.CampaignClientComment == itemProduct.CampaignClientComment) {

                    update = false;
                } else {
                    itemProduct.CampaignClientComment = item.CampaignClientComment
                    update = true;
                }


                if (update == true) {
                    arrayTempUpdateOptions.push(itemProduct)
                }
                i = true;
            }
        })
        if (i == false) {
            let data = {
                CampaignID: item.CampaignID,
                CategoryID: item.CategoryID,
                CampaignClientComment: item.CampaignClientComment
            }
            arrayTempNewOptions.push(data)
        }


    })


    products.value.forEach(item => {
        if (item.ClientID == product.value.ClientID) {
            if (item.ClientName == product.value.ClientName) {

            } else {
                ""
            }
            if (item.PhoneNumber == product.value.PhoneNumber) {

            } else {

            }

            item.CategoryAndCampaign.forEach(item => {



            })

        }


    })


    async function performRegister() {
        await Promise.all(arrayTempNewOptions.map(async (item) => {
            let categoryValidator = true;
            product.value.CategoryAndCampaign.forEach(itemProduct => {
                console.log(item.CategoryID + " " + itemProduct.CategoryID)
                if (item.CategoryID == itemProduct.CategoryID) {

                    categoryValidator = false;


                }



            });


            if (categoryValidator === true) {
                let data = {
                    clientID: product.value.ClientID,
                    categoryID: item.CategoryID
                };
                console.log(data)
                console.log(item)
                try {
                    const result = await axios.post((config.URLBACKEND + "/category/client"), data);
                    // Aquí puedes hacer lo que necesites con el resultado
                    console.log(result)
                    if (result.status === 200 || result.response.status === 200) {
                        
                    } else {
                     
                        messageError += "Error al registrar Categoria"
                    }
                } catch (error) {
                    console.error("Error al enviar la solicitud:", error);
                    // mensajeError+= "Error al enviar la solicitud de Categoria"
                    //codigoError= error.response.data.code

                }
            }

            let dataClientCampaign = {
                clientID: product.value.ClientID,
                campaignID: item.CampaignID,
                comment: item.CampaignClientComment
            };
            console.log(dataClientCampaign)
            try {
                if (validator == true) {
                    const result = await axios.post((config.URLBACKEND + "/campaign/client"), dataClientCampaign);
                    // Aquí puedes hacer lo que necesites con el resultado
                    console.log(result)
                    if (result.status === 200 || result.response.status === 200) {
                        validator = true
                    } else {
                        validator = false
                        messageError += "Error al registrar Campaña"
                    }
                }
            } catch (error) {
                console.error("Error al enviar la solicitud:", error);
                messageError += "Error al enviar la solicitud de Campaña";
                codeError = error.response.data.code

                validator = false
            }
        }));


    }

    await performRegister();
    console.log(messageError)


    if (validator == true) {

        toast.add({ severity: 'success', summary: 'Registro', detail: 'Campaña Registrada', life: 3000 });

    } else {

        if (codeError == "EREQUEST") {
            toast.add({ severity: 'error', summary: 'Datos ya registrado', detail: 'El cliente ya tiene la campaña registrada' + messageError, life: 10000 });
        } else {
            toast.add({ severity: 'error', summary: 'Datos ya registrado', messageError, life: 10000 });
        }
    }

    console.log("Supuestamente listo")

    productDialog.value = false;

};

const editProduct = (editProduct) => {

    product.value = { ...editProduct };
    productDialog.value = true;
    filterEditCategory(editProduct);
    //   selectedCategories.value = categoriasGlobal.filter(option => option)
    //console.log("Aqui "  + categoriasGlobal.filter(option => option))


};

const confirmDeleteProduct = (editProduct) => {


    deleteProductDialog.value = true;

};

const deleteProduct = () => {
    products.value = products.value.filter((val) => val.id !== product.value.id);
    deleteProductDialog.value = false;
    product.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
};

const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};
const deleteSelectedProducts = () => {
    products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
    deleteProductsDialog.value = false;
    selectedProducts.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        ClientName: { value: null, matchMode: FilterMatchMode.CONTAINS },
        'CategoryAndCampaign.CampaignID': { value: null, matchMode: FilterMatchMode.CONTAINS },
        CategoryAndCampaign: { value: null, matchMode: FilterMatchMode.CONTAINS },
        Category: { value: null, matchMode: FilterMatchMode.CONTAINS },
        Campaign: { value: null, matchMode: FilterMatchMode.CONTAINS },
        PhoneNumber: { value: null, matchMode: FilterMatchMode.CONTAINS },
        ClientID: { value: null, matchMode: FilterMatchMode.CONTAINS },
        status: { value: null, matchMode: FilterMatchMode.EQUALS },
        verified: { value: null, matchMode: FilterMatchMode.EQUALS },
        CampaignID: { value: null, matchMode: FilterMatchMode.CONTAINS },
        CampaignName: { value: null, matchMode: FilterMatchMode.CONTAINS }

    };
};

const initCategory = async () => {
    const responseCategory = await axios.get(config.URLBACKEND + "/category/all");
    categoryGlobal.value = responseCategory.data.result;
};
const initCampaign = async () => {
    const responseCampaign = await axios.get(config.URLBACKEND + "/campaign/all");
    campaignGlobal.value = responseCampaign.data.result;
    
    categoryGlobal.value.forEach(itemCategory =>{

        campaignGlobal.value.forEach(itemCampaign =>{

            if(itemCategory.CategoryID ==itemCampaign.CategoryID){
            

                itemCampaign.CampaignName = itemCategory.CategoryName.substring(0,3) + " - " +itemCampaign.CampaignName;
            }

        })
        


    })
   // CampañaGlobal.value = responseCampañas.data.result;
    backupCampaignGlobal.value = responseCampaign.data.result;


    
};

const filterCategoryCampaign = (options) => {


    const tempCampaignGlobal = backupCampaignGlobal.value;
    campaignGlobal.value = tempCampaignGlobal;
    let tempArrayCampaignGlobal = [];

    options.forEach(itemCategory => {
        campaignGlobal.value.forEach(itemCampaign => {
            //      console.log(itemCategoria.ID + " = " +ItemCampaña.CategoriaID )
            if (itemCategory.CategoryID === itemCampaign.CategoryID) {


                tempArrayCampaignGlobal.push(itemCampaign);
            }


        })
    })


    campaignGlobal.value = tempArrayCampaignGlobal;




}

const handleCustomFilter = (event, filterCallback) => {

    let tempArray = []
    event.value.forEach(item => {
        tempArray.push(item.CategoryID)

    })
    const value = tempArray;
    console.log(tempArray)


    // console.log("probando " + value)
    //console.log(selectedCategories)
    filterCategoryCampaign(event.value)
    if (value.length != 0) {

        //  console.log(productRespaldo.value)
        const tempProduct = productBackup.value;
        products.value = tempProduct
        const tempArrayProduct = [];
        products.value.forEach(product => {

            product.CategoryAndCampaign.some(item => {

                if (value.includes(item.CategoryID)) {

                    tempArrayProduct.push(product)

                }


                //  return item.CategoriaID.toLowerCase().includes(value) || item.CategoriaID.toLowerCase().includes(value);
            });
        });

        const filteredData = tempArrayProduct;
        //   filterCallback(filteredData, 'custom', 'CategoriaYCampana');
        //  console.log(productRespaldo.value)
        console.log(filteredData)

        products.value = filteredData;
        // console.log(productRespaldo.value)

    } else {
   

        products.value = productBackup.value;
    }

    selectedCampaign.value = null
};

const handleCustomFilterCampaign = (event, filterCallback) => {


    let tempArray = []
    event.value.forEach(item => {
        tempArray.push(item.CampaignID)

    })
    const value = tempArray;




    if (value.length != 0) {

        const tempProduct = productBackup.value;
        products.value = tempProduct
        const tempArrayProduct = [];
        products.value.forEach(product => {

            product.CategoryAndCampaign.some(item => {

                if (value.includes(item.CampaignID)) {

                    tempArrayProduct.push(product)

                }


                //  return item.CategoriaID.toLowerCase().includes(value) || item.CategoriaID.toLowerCase().includes(value);
            });
        });

        const filteredData = tempArrayProduct;

        products.value = filteredData;
        // console.log(productRespaldo.value)

    } else {
      

        handleCustomFilter(selectedCategory)

        //    products.value = productRespaldo.value;
    }
};

const filterEditCategory = (selectedItems) => {

    copiedOptions.value = categoryGlobal.value;
    let arrayOptions = []



    selectedItems.CategoryAndCampaign.forEach(item => {

        categoryGlobal.value.forEach(itemCategry => {

            let validator = false
            if (item.CategoryID == itemCategry.CategoryID) {

                if (validator === false) {
                    arrayOptions.forEach(i => {
                        if (i == itemCategry.CategoryID) {
                            validator = true
                        }
                    });
                }
                if (validator === false) {
                    arrayOptions.push(itemCategry.CategoryID)
                }
            }
        });
    })

    // Filtrar las opciones seleccionadas del array global
    selectedOptions.value = categoryGlobal.value.filter(option =>
    arrayOptions.includes(option.CategoryID)
    );
    filterEditCampaign(selectedItems);
}

const exportCSV = () => {
 
    dt.value.exportCSV();
};

const filterEditCampaign = (selectedItems) => {

    const tempCampaignGlobal = backupCampaignGlobal.value;
    campaignGlobal.value = tempCampaignGlobal;

    copiedOptionsCampaign.value = campaignGlobal.value;
    let arrayOptions = []
    let tempArrayCampaignGlobal = []

    //console.log(itemCategorias.ID + " =  " +item.ID)

    selectedItems.CategoryAndCampaign.forEach(item => {


        campaignGlobal.value.forEach(itemCampaign => {

            if (item.CampaignID == itemCampaign.CampaignID) {
                itemCampaign.CampaignClientComment = item.CampaignClientComment
                arrayOptions.push(itemCampaign.CampaignID)
            }

            let validator = false



            if (item.CategoryID == itemCampaign.CategoryID) {

                if (validator === false) {
                    tempArrayCampaignGlobal.forEach(i => {
                        if (i.CamapignID == itemCampaign.CampaignID) {
                            validator = true
                        }
                    });

                }

                if (validator === false) {
                    
                    tempArrayCampaignGlobal.push(itemCampaign)
                }

            }
        })
    })
    // Filtrar las opciones seleccionadas del array global

    copiedOptionsCampaign.value = tempArrayCampaignGlobal;
    console.log(arrayOptions)
    selectedOptionsCampaign.value = campaignGlobal.value.filter(option =>
    arrayOptions.includes(option.CampaignID)
    );



}

const filterEditOptionCampaign = (options) => {

    let tempArrayCampaignGlobal = [];

    options.value.forEach(itemCategory => {
        console.log(campaignGlobal.value)
        campaignGlobal.value.forEach(itemCampaign => {
            console.log(itemCategory.CategoryID + " = " + itemCampaign.CategoryID)
            if (itemCategory.CategoryID === itemCampaign.CategoryID) {

                //  ItemCampaña.Nombre= (itemCategoria.Nombre.substring(0,3) +" - "+ItemCampaña.Nombre)
                tempArrayCampaignGlobal.push(itemCampaign);
            }
        })
    })
    copiedOptionsCampaign.value = tempArrayCampaignGlobal;
}

</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            
                            <Button label="Nuevo" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                            <Button label="Eliminar" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected"
                                :disabled="!selectedProducts || !selectedProducts.length" />
                        </div>
                    </template>

                    <-<template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Importar" class="mr-2 inline-block" />
                        <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="products" v-model:selection="selectedProducts" dataKey="id"
                    :paginator="true" :rows="20" filterDisplay="row" :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25, 50, 100]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Clientes: Categoria - Campaña</h5>

                        </div>
                    </template>



                    <Column selectionMode="multiple"></Column>
                    <Column field="ClientID" header="Codigo" :sortable="true">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.ClientID }}
                        </template>
                        <!-- <template #filter="{ filterModel, filterCallback }">
                            <InputText class="w-full sm:w-5rem" v-model="filters['ClientID'].value"
                                placeholder="Buscar codigo..." />
                        </template> -->
                    </Column>


                    <Column field="ClientName" header="Nombre" :sortable="true">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.ClientName }}
                        </template>
                        <!-- <template #filter="{ filterModel, filterCallback }">
                            <InputText class="w-full sm:w-auto" v-model="filters['ClientName'].value"
                                placeholder="Buscar nombre..." />
                        </template> -->
                    </Column>
                    <Column field="PhoneNumber" header="Numero" :sortable="true">
                        <template #body="slotProps">
                            <span class="p-column-title">Price</span>

                            {{ formatPhoneNumber(slotProps.data.PhoneNumber) }}

                        </template>
                        <!-- <template #filter="{ filterModel, filterCallback }">
                            <InputText class="w-full sm:w-9rem" v-model="filters['PhoneNumber'].value"
                                placeholder="Buscar numero..." />
                        </template> -->
                    </Column>
                    <Column field="Category" header="Categoria" :showFilterMenu="false" :sortable="true">
                        <template #body="slotProps">
                                <div v-for="item in slotProps.data.CategoryAndCampaign" :key="item.CampaignID">
                                    <p>{{ item.CategoryName }}</p>
                                </div>
                        </template>

                        <!-- <template #filter="{ filterModel, filterCallback }">
                            <MultiSelect v-model="selectedCategory" :options="categoryGlobal" optionLabel="CategoryName"
                                placeholder="Categorias..." class="w-full md:w-14rem" style="min-width: 14rem" filter
                                display="chip" :maxSelectedLabels="3"
                                @change="handleCustomFilter($event, filterCallback)">
                                <template #option="slotProps">

                                    {{ slotProps.option.CategoryName }}
                                </template>
                            </MultiSelect>
                        </template> -->
                    </Column>


                    <Column field="Campaign" header="Campaña" :showFilterMenu="false">
                        <template #body="slotProps">
                            <span class="p-column-title">Campaña</span>
                                <div v-for="item in slotProps.data.CategoryAndCampaign" :key="item.CampaignID">
                                    <p>{{ item.CampaignName }}</p>
                                </div>
                        </template>
                        <!-- <template #filter="{ filterModel, filterCallback }">
                            <MultiSelect v-model="selectedCampaign" :options="campaignGlobal" optionLabel="CampaignName"
                                placeholder="Selecciona una campaña" class="w-full md:w-14rem" style="min-width: 14rem"
                                filter display="chip" :maxSelectedLabels="3"
                                @change="handleCustomFilterCampaign($event)">


                                <template #option="slotProps">
                                    <div class="flex align-items-center gap-2">

                                        {{ slotProps.option.CampaignName }}


                                    </div>
                                </template>
                            </MultiSelect>
                        </template> -->
                    </Column>

                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded
                                @click="editProduct(slotProps.data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded
                                @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="Product Details"
                    :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="Nombre">Nombre</label>
                        <InputText id="Nombre" v-model.trim="product.ClientName" required="true" autofocus
                            :invalid="submitted && !product.ClientName" />
                        <small class="p-invalid" v-if="submitted && !product.ClientName">Nombre es requerido.</small>
                    </div>

                    <div class="field">
                        <label for="Numero">Numero</label>
                        <InputText id="Numero" v-model.trim="product.PhoneNumber" required="true" autofocus
                            :invalid="submitted && !product.PhoneNumber" />
                        <small class="p-invalid" v-if="submitted && !product.PhoneNumber">Numero es requerido.</small>
                    </div>
                    <div class="field">
                        <label for="description">Categoria</label>

                        <div>

                            <MultiSelect :options="copiedOptions" optionLabel="CategoryName" placeholder="Categorias..."
                                class="w-full md:w-25rem" style="min-width: 25rem" filter display="chip"
                                :maxSelectedLabels="3" v-model="selectedOptions"
                                @change="filterEditOptionCampaign($event)">
                                <template #option="slotProps">
                                    {{ slotProps.option.CategoryName }}
                                </template>
                            </MultiSelect>


                        </div>
                    </div>

                    <div class="field">
                        <label for="description">Campaña</label>

                        <div>

                            <MultiSelect :options="copiedOptionsCampaign" optionLabel="CampaignName"
                                placeholder="Campañas..." class="w-full md:w-25rem" style="min-width: 25rem" filter
                                display="chip" :maxSelectedLabels="3" v-model="selectedOptionsCampaign">
                                <template #option="slotProps">
                                    {{ slotProps.option.CampaignName }}

                                </template>
                            </MultiSelect>


                        </div>



                    </div>
                    <div class="field">

                        <div v-for="(text, index) in selectedOptionsCampaign" :key="index">
                            <label for="text">{{

                                selectedOptionsCampaign[index].CampaignName }}</label>
                            <Textarea id="nombre" v-model.trim="selectedOptionsCampaign[index].CampaignClientComment"
                                required="true" rows="3" cols="20" />


                        </div>

                    </div>
                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" text="" @click="hideDialog" />
                        <Button label="Guardar" icon="pi pi-check" text=""
                            @click="saveProduct(selectedOptionsCampaign)" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm"
                    :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete <b>{{ product.name }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm"
                    :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete the selected products?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
