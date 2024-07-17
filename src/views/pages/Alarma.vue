<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { Buffer } from 'buffer';

import axios from 'axios';
import config from '../config.js';
const toast = useToast();

const active = ref(0);

const items = ref([
    { label: 'Clientes', icon: 'pi pi-home' },
    { label: 'Consultar', icon: 'pi pi-chart-line' },
    { label: 'Registro', icon: 'pi pi-list' },
    { label: 'Detalles', icon: 'pi pi-inbox' }
]);

const images = ref([]);

const activeIndex = ref(0);
const responsiveOptions = ref([
    {
        breakpoint: '1024px',
        numVisible: 5
    },
    {
        breakpoint: '768px',
        numVisible: 3
    },
    {
        breakpoint: '560px',
        numVisible: 1
    }
]);
const displayCustom = ref(false);

const imageClick = (index) => {
    activeIndex.value = index;
    displayCustom.value = true;
};



//variable para el registro de datos  <----

//inputs
const inputClientName = ref(null);
const inputPhoneNumber = ref(null);
const inputDocumentNumber = ref(null);



const selectionDropdownDocumentType = ref([]);
const dropdownDocumentType = ref([]);

//Prop Inputs

const inputClientNameInvalid = ref(true);
const inputPhoneNumberInvalid = ref(true);
const inputDocumentNumberInvalid = ref(false);


// Dialog


const dialogSaveData = ref(false);
const dialogCorrectData = ref(false);
const dialogValidateDataBD = ref(false);
const dialogRegisterClient = ref(false);
// 

const comment = ref(null);
const warning = ref(null);
const duplicateDataWarning = ref(null);
const dataSend = ref({});

//
const fileUploadDocumentImage = ref(null);
const filesImage = ref([]);

//const toast = ref(null);

// Método para disparar la carga de archivos


const selectionCamapaignGlobal = ref([]);
const campaignGlobal = ref([]);
const backupCampaignGlobal = ref([]);

const selectionCategoryGlobal = ref([]);
const categoryGlobal = ref([]);
const image = ref(null);

//variable para el registro de datos  --->

//Variables para la consultar de datoas <---

const selectionMultiSelectDocumentType = ref([]);
const multiSelectDocumentType = ref([]);
const dataDocumentType = ref([])

const clients = ref([]);
const clientsBackup = ref({});
const clientView = ref({});
const clientSelection = ref({});


const dateStart = ref(null);
const dateEnd = ref(null);


const clientsEditDialog = ref(false);
const ClientsRemoveDialog = ref(false);
const viewDataImageDialog = ref(false);

const selectDocumentTypeViewDataImage = ref([]);


const size = ref({ label: 'Small', value: 'small' });

const productBackup = ref({});

const selectedProducts = ref(null);
const dt = ref(null);

const filtersClient = ref({});

const submitted = ref(false);


const copiedOptions = ref([]);
const copiedOptionsCampaign = ref([]);
const selectedOptions = ref([]);
const selectedOptionsCampaign = ref([]);



onBeforeMount(async () => {
    initFilters();



    if (!dataDocumentType.value || !dropdownDocumentType) {
        dataDocumentType.value = await initDocumentType();
        dropdownDocumentType.value = await initDocumentType();
    }

    await initCategory();
    initCampaign();


});
onMounted(async () => {

    await initFilters();
    dataDocumentType.value = await initDocumentType();
    clients.value = await DataClientBD();



});

const resetData = () => {

    inputClientName.value = null
    inputPhoneNumber.value = null
    inputDocumentNumber.value = null
    selectionCamapaignGlobal.value = null
    selectionCategoryGlobal.value = null
    selectionDropdownDocumentType.value = null
    image.value = null
    filesImage.value = []
    fileUploadDocumentImage.value.clear();

}
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
const DataClientBD = async (dateStart, dateEnd) => {

    let dataClients;

    if (dateStart) {

        const dataParams = {

            params: {
                startDate: dateStart,
                endDate: dateEnd
            }
        };

        console.log(dataParams)
        const responseClient = await axios.get(config.URLBACKEND + "/client/date", dataParams);
        dataClients = responseClient.data.result;

    } else {


        const responseClient = await axios.get(config.URLBACKEND + "/client/all");
        dataClients = responseClient.data.result;
    }


    if (!dataDocumentType.value) {
        dataDocumentType.value = await initDocumentType();
    }


    console.log(dataDocumentType.value)

    dataClients.forEach(itemDataClient => {
        if (itemDataClient.DocumentNumber == "null") {
            itemDataClient.DocumentNumber = ""
        }

        if (itemDataClient.DocumentTypeID != null) {
            dataDocumentType.value.forEach(itemDocumentType => {

                if (itemDataClient.DocumentTypeID == itemDocumentType.DocumentTypeID) {
                    itemDataClient.DocumentTypeName = itemDocumentType.DocumentTypeName
                }

            })
        }


        if (isNaN(new Date(itemDataClient.Created).getTime())) {
            console.error('La fecha original es inválida');
        } else {
            const date = new Date(itemDataClient.Created);
            itemDataClient.Created = formatDate.format(date)
        }

    })
    console.log(dataClients)


    clientsBackup.value = dataClients;

    return dataClients
}


const getDataCliente = async () => {

    try {
        let data
        // Realiza la solicitud para obtener los datos de los clientes con las campañas
        const responseClient = await axios.get(config.URLBACKEND + "/clientecampana");
        data = responseClient.data.result;

        // Realiza la solicitud para obtener todas las campañas
        const responseCampañas = await axios.get(config.URLBACKEND + "/campana");
        const campañas = responseCampañas.data.result;

        const responseCategorias = await axios.get(config.URLBACKEND + "/categoria");
        const categorias = responseCategorias.data.result;



        // Asigna las categorías a cada cliente en el objeto de datos
        data.forEach(cliente => {
            cliente.CategoriaYCampana = [];
            let i = 0;
            if (cliente.CampañaID && cliente.CampañaID.length > 0) {


                cliente.CampañaID.forEach(clientecampaña => {
                    //   console.log(clientecampaña)


                    campañas.forEach(campaña => {
                        //   console.log(clientecampaña +" y " +campaña.ID)


                        if (parseInt(clientecampaña) == parseInt(campaña.ID)) {

                            //   console.log(campaña +" y4 " + categorias)
                            categorias.forEach(categoria => {

                                //    console.log(campaña.CategoriaID +" y2 " +categoria.ID)
                                if (parseInt(campaña.CategoriaID) == parseInt(categoria.ID)) {
                                    if (cliente.ClienteCampañaObservacion[i] === "null") {
                                        cliente.ClienteCampañaObservacion[i] = ""
                                    }

                                    cliente.CategoriaYCampana.push({

                                        CategoriaID: categoria.ID,
                                        CategoriaNombre: categoria.Nombre,
                                        CampañaID: campaña.ID,
                                        CampañaNombre: campaña.Nombre,
                                        ClienteCampañaID: parseInt(cliente.ClienteCampañaID[i]),
                                        Observacion: cliente.ClienteCampañaObservacion[i]
                                    })

                                    i++;
                                }

                            })
                        }
                    })
                })
            }

            if (cliente.CampañaID && cliente.CampañaID.length > 0) {
                //   cliente.CampañaNombre = cliente.CampañaID.join(', '); // Puedes mostrar los IDs o los nombres de las campañas
                cliente.CategoriaNombre = cliente.CampañaID.map(id => categorias[campañas[id]]).join(', ');
            } else {
                //   cliente.CampañaNombre = ''; // Si no hay campañas, asigna una cadena vacía
                cliente.CategoriaNombre = ''; // Si no hay campañas, asigna una cadena vacía
            }
        });

        campañas.forEach(campaña => {
            campañas[campaña.ID] = campaña.Nombre;
        });

        data.forEach(cliente => {
            if (cliente.CampañaID && cliente.CampañaID.length > 0) {
                cliente.CampañaNombre = cliente.CampañaID.map(id => campañas[id]).join(', ');
            } else {
                cliente.CampañaNombre = ''; // Si no hay campañas, asigna una cadena vacía
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
    const charactersValid = /^[a-zA-Z\s]+$/; // Solo permite letras y espacios en blanco

    if (!charactersValid.test(name)) {
        return false; // Si contiene caracteres no válidos, devuelve false
    }

    return true; // Si no contiene caracteres no válidos, devuelve true
}

// Función para validar un número
const validateNumber = (number) => {
    const charactersValid = /^[0-9]+$/; // Solo permite dígitos

    if (!charactersValid.test(number)) {
        return false; // Si contiene caracteres no válidos, devuelve false
    }

    return true; // Si no contiene caracteres no válidos, devuelve true
}


const saveProduct = async (Selecciones) => {

    let validador = true;
    let codigoError;
    let mensajeError = "";
    let ArrayTempActualizarOpciones = []
    let ArrayTempNuevasOpciones = []

    products.value.forEach(item => {

        if (product.value.ClientesID == item.ClientesID) {

            if (item.Nombre != product.value.Nombre) {
                if (validateName(product.value.Nombre)) {
                    console.log("Caracteres validos" + product.value.Nombre)
                } else {
                    console.log("caracteres no validos" + product.value.Nombre)

                }
            } else {
                console.log("No requiere ser modificado")
            }
        }


    })



    Selecciones.forEach(item => {

        let i = false
        product.value.CategoriaYCampana.forEach(itemProduct => {
            let actualizar = false;
            if (itemProduct.CampañaID == item.ID) {
                if (item.Observacion == itemProduct.Observacion) {

                    actualizar = false;
                } else {
                    itemProduct.Observacion = item.Observacion
                    actualizar = true;
                }


                if (actualizar == true) {
                    ArrayTempActualizarOpciones.push(itemProduct)
                }
                i = true;
            }
        })
        if (i == false) {
            let data = {
                CampañaID: item.ID,
                CategoriaID: item.CategoriaID,
                Observacion: item.Observacion
            }
            ArrayTempNuevasOpciones.push(data)
        }


    })


    products.value.forEach(item => {
        if (item.ClientesID == product.value.ClientesID) {
            if (item.Nombre == product.value.Nombre) {

            } else {
                ""
            }
            if (item.Numero == product.value.Numero) {

            } else {

            }

            item.CategoriaYCampana.forEach(item => {



            })

        }


    })


    async function RealizarRegistro() {
        await Promise.all(ArrayTempNuevasOpciones.map(async (item) => {
            let CategoriaValidador = true;
            product.value.CategoriaYCampana.forEach(itemProducto => {
                console.log(item.CategoriaID + " " + itemProducto.CategoriaID)
                if (item.CategoriaID == itemProducto.CategoriaID) {
                    CategoriaValidador = false;
                }
            });


            if (CategoriaValidador === true) {
                let data = {
                    clientesID: product.value.ClientesID,
                    categoriaID: item.CategoriaID
                };

                try {
                    const result = await axios.post((config.URLBACKEND + "/clientecategoria"), data);
                    // Aquí puedes hacer lo que necesites con el resultado

                    if (result.status === 200 || result.response.status === 200) {

                    } else {

                        mensajeError += "Error al registrar Categoria"
                    }
                } catch (error) {
                    console.error("Error al enviar la solicitud:", error);
                    // mensajeError+= "Error al enviar la solicitud de Categoria"
                    //codigoError= error.response.data.code

                }
            }

            let dataClienteCampaña = {
                clientesID: product.value.ClientesID,
                campañaID: item.CampañaID,
                observacion: item.Observacion
            };

            try {
                if (validador == true) {
                    const result = await axios.post((config.URLBACKEND + "/clientecampana"), dataClienteCampaña);
                    // Aquí puedes hacer lo que necesites con el resultado
                    console.log(result)
                    if (result.status === 200 || result.response.status === 200) {
                        validador = true
                    } else {
                        validador = false
                        mensajeError += "Error al registrar Campaña"
                    }
                }
            } catch (error) {
                console.error("Error al enviar la solicitud:", error);
                mensajeError += "Error al enviar la solicitud de Campaña";
                codigoError = error.response.data.code

                validador = false
            }
        }));


    }

    await RealizarRegistro();
    console.log(mensajeError)


    if (validador == true) {

        toast.add({ severity: 'success', summary: 'Registro', detail: 'Campaña Registrada', life: 3000 });

    } else {

        if (codigoError == "EREQUEST") {
            toast.add({ severity: 'error', summary: 'Datos ya registrado', detail: 'El cliente ya tiene la campaña registrada' + mensajeError, life: 10000 });
        } else {
            toast.add({ severity: 'error', summary: 'Datos ya registrado', mensajeError, life: 10000 });
        }
    }

    console.log("Supuestamente listo")

    productDialog.value = false;

};

const initCategory = async () => {
    const responseCategorias = await axios.get(config.URLBACKEND + "/category/all");
    categoryGlobal.value = responseCategorias.data.result;
};
const initCampaign = async () => {
    const responseCampañas = await axios.get(config.URLBACKEND + "/campaign/all");
    campaignGlobal.value = responseCampañas.data.result;

    console.log(campaignGlobal.value)
    categoryGlobal.value.forEach(itemCategory => {

        campaignGlobal.value.forEach(itemCampaign => {

            if (itemCategory.CategoryID == itemCampaign.CategoryID) {


                itemCampaign.CampaignName = itemCategory.CategoryName.substring(0, 3) + " - " + itemCampaign.CampaignName;
            }

        })



    })
    // CampañaGlobal.value = responseCampañas.data.result;
    backupCampaignGlobal.value = campaignGlobal.value;
};

const initDocumentType = async () => {
    const responseDocumentType = await axios.get(config.URLBACKEND + "/documenttype/all");
    multiSelectDocumentType.value = responseDocumentType.data.result;
    dropdownDocumentType.value = responseDocumentType.data.result;

    return responseDocumentType.data.result

};


const functionInputClientName = (event) => {



    if ((event.target._value.length < 3) || (!validateName(event.target._value))) {
        inputClientNameInvalid.value = true
    } else {
        inputClientNameInvalid.value = false
    }

}


const functionInputPhoneNumber = () => {


    if (((inputPhoneNumber.value) < 100000) || (!validateNumber(inputPhoneNumber.value))) {
        inputPhoneNumberInvalid.value = true
    } else {
        inputPhoneNumberInvalid.value = false
    }
}

const functionInputDocumentNumber = (event) => {

    if ((event.target._value.length < 5) || (!validateNumber(event.target._value))) {
        inputDocumentNumberInvalid.value = true
    } else {
        inputDocumentNumberInvalid.value = false
    }




}



const FilterCategoryCampaign = (options) => {


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

    FilterCategoryCampaign(event.value)


    selectedOptionsCampaign.value = null
};

const handleCustomFilterCampaña = (event, filterCallback) => {


    let tempArray = []
    event.value.forEach(item => {
        tempArray.push(item.ID)

    })
    const value = tempArray;




    if (value.length != 0) {

        const TempProduct = productBackup.value;
        products.value = TempProduct
        const tempArrayProduct = [];
        products.value.forEach(product => {

            product.CategoriaYCampana.some(item => {

                if (value.includes(item.CampañaID)) {

                    tempArrayProduct.push(product)

                }


                //  return item.CategoriaID.toLowerCase().includes(value) || item.CategoriaID.toLowerCase().includes(value);
            });
        });

        const filteredData = tempArrayProduct;

        products.value = filteredData;
        // console.log(productRespaldo.value)

    } else {
        //    initFilters();

        handleCustomFilter(selectedCategories)

        //    products.value = productRespaldo.value;
    }
};

const FiltroEditCategoria = (selectedItems) => {

    copiedOptions.value = categoryGlobal.value;
    let ArrayOpciones = []



    selectedItems.CategoriaYCampana.forEach(item => {

        categoryGlobal.value.forEach(itemCategorias => {

            let validador = false
            if (item.CategoriaID == itemCategorias.ID) {

                if (validador === false) {
                    ArrayOpciones.forEach(i => {
                        if (i == itemCategorias.ID) {
                            validador = true
                        }
                    });
                }
                if (validador === false) {
                    ArrayOpciones.push(itemCategorias.ID)
                }
            }
        });
    })

    // Filtrar las opciones seleccionadas del array global
    selectedOptions.value = categoryGlobal.value.filter(option =>
        ArrayOpciones.includes(option.ID)
    );
    FiltroEditCampana(selectedItems);
}
const initFilters = () => {
    filtersClient.value = {

        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        ClientName: { value: null, matchMode: FilterMatchMode.CONTAINS },
        ClientID: { value: null, matchMode: FilterMatchMode.CONTAINS },
        'CategoryAndCampaign.CampaignID': { value: null, matchMode: FilterMatchMode.CONTAINS },
        CategoryAndCampaign: { value: null, matchMode: FilterMatchMode.CONTAINS },
        Category: { value: null, matchMode: FilterMatchMode.CONTAINS },
        Campaign: { value: null, matchMode: FilterMatchMode.CONTAINS },
        PhoneNumber: { value: null, matchMode: FilterMatchMode.CONTAINS },
        ClientID: { value: null, matchMode: FilterMatchMode.CONTAINS },
        status: { value: null, matchMode: FilterMatchMode.EQUALS },
        verified: { value: null, matchMode: FilterMatchMode.EQUALS },

        DocumentNumber: { value: null, matchMode: FilterMatchMode.CONTAINS },
        CampaignID: { value: null, matchMode: FilterMatchMode.CONTAINS },
        CampaignName: { value: null, matchMode: FilterMatchMode.CONTAINS }

    };
};

const FiltroEditCampana = (selectedItems) => {

    const tempCampaignGlobal = backupCampaignGlobal.value;
    campaignGlobal.value = TempCampaignGlobal;

    copiedOptionsCampaign.value = campaignGlobal.value;
    let ArrayOpciones = []
    let tempArrayGlobanlCampañas = []

    //console.log(itemCategorias.ID + " =  " +item.ID)

    selectedItems.CategoriaYCampana.forEach(item => {


        campaignGlobal.value.forEach(itemCampaña => {

            if (item.CampañaID == itemCampaña.ID) {
                itemCampaña.Observacion = item.Observacion
                ArrayOpciones.push(itemCampaña.ID)
            }

            let validador = false



            if (item.CategoriaID == itemCampaña.CategoriaID) {

                if (validador === false) {
                    tempArrayGlobanlCampañas.forEach(i => {
                        if (i.ID == itemCampaña.ID) {
                            validador = true
                        }
                    });

                }

                if (validador === false) {

                    tempArrayGlobanlCampañas.push(itemCampaña)
                }

            }
        })
    })
    // Filtrar las opciones seleccionadas del array global

    copiedOptionsCampaign.value = tempArrayGlobanlCampañas;
    selectedOptionsCampaign.value = campaignGlobal.value.filter(option =>
        ArrayOpciones.includes(option.ID)
    );



}

const FiltroEditOpcionesCampaña = (Opciones) => {

    let tempArrayGlobanlCampañas = [];

    Opciones.value.forEach(itemCategoria => {
        console.log(campaignGlobal.value)
        campaignGlobal.value.forEach(ItemCampaña => {
            console.log(itemCategoria.ID + " = " + ItemCampaña.CategoriaID)
            if (itemCategoria.ID === ItemCampaña.CategoriaID) {

                //  ItemCampaña.Nombre= (itemCategoria.Nombre.substring(0,3) +" - "+ItemCampaña.Nombre)
                tempArrayGlobanlCampañas.push(ItemCampaña);
            }
        })
    })
    copiedOptionsCampaign.value = tempArrayGlobanlCampañas;
}


const onUpload = async (event) => {

    image.value = event.files[0].objectURL;
    console.log(event.files[0].objectURL)
    //await uploadImage()

    // SubirImagen();
    toast.add({ severity: 'info', summary: 'Establecido', detail: 'Imagen preparada para subir', life: 5000 });


};



const validateSendClient = () => {

    let errorMessage = "", errorBolean = false;

    if (!validateName(inputClientName.value)) {
        errorBolean = true
        errorMessage += "\n- Error el nombre contiene letras y caracteres no validos"
    }
    if (inputClientName.value == null) {
        errorBolean = true
        errorMessage += "\n- Error nombre no ingresado"
    }
    if (inputPhoneNumber.value != null) {

        if (inputPhoneNumber.value < 10000000) {
            errorBolean = true
            errorMessage += "\n- Error numero no ingresado"
        }

        if (!validateNumber(inputPhoneNumber.value)) {
            errorBolean = true
            errorMessage += "\n- Error el N° Telefono contiene letras y caracteres no validos"
        }
    } else {
        if (inputPhoneNumber.value < 10000000) {
            errorBolean = true
            errorMessage += "\n- Error numero no ingresado"
        }
    }




    if (inputDocumentNumber.value != null) {
        if ((inputDocumentNumber.value.length > 1) && inputDocumentNumber.value.length < 15) {
            if (inputDocumentNumber.value.length < 5) {
                errorBolean = true
                errorMessage += "\n- Error el N° Documento tiene menos de 4 digito, debe tener mas de 4"
            }
            if (!validateNumber(inputDocumentNumber.value)) {
                errorBolean = true
                errorMessage += "\n- Error el N° Documento contiene letras y caracteres no validos"
            }

            if (selectionDropdownDocumentType.value.length == 0) {
                errorBolean = true
                errorMessage += "\n- Error Tipo Documento no seleccionado"
            }

        }
    }




    warning.value = errorMessage
    return [errorBolean, errorMessage]


}



const validatorCommentSendClient = async () => {

    let errorMessage = "", errorBolean = false;


    if (selectionDropdownDocumentType.value.length == 0) {
        errorBolean = true
        errorMessage += "\n- Tipo de documento no seleccionado"
    }

    if (inputDocumentNumber.value == null) {
        errorBolean = true
        errorMessage += "\n- Numero de documento no ingresado"
    }

    if (selectionDropdownDocumentType.value.length != 0 && inputDocumentNumber.value != null) {


        console.log(selectionDropdownDocumentType.value)
        console.log(inputDocumentNumber.value)
        dataSend.value.documentTypeID = selectionDropdownDocumentType.value.DocumentTypeID
        dataSend.value.documentNumber = inputDocumentNumber.value
    } else {
        dataSend.value.documentTypeID = null
        dataSend.value.documentNumber = null
    }

    if (filesImage.value === null) {
        errorBolean = true
        errorMessage += "\n- Imagen no ingresada"
        dataSend.value.documentImage = null
    } else {

        //   uploadImage();
    }

    if (selectionCamapaignGlobal._rawValue == 0) {
        errorBolean = true
        errorMessage += "\n- Categoria o Campaña no seleccionada para el cliente"
        dataSend.value.campaign = null

    } else {

        dataSend.value.campaign = selectionCamapaignGlobal._rawValue
    }
    console.log(selectionCamapaignGlobal)
    console.log(dropdownDocumentType)

    comment.value = errorMessage;
    return [errorBolean, errorMessage]


}

const validatePhoneNumberBD = async () => {

    let errorMessage = "", errorBolean = false;
    const data = {
        params: {
            phoneNumber: inputPhoneNumber.value
        }
    };

    const result = await axios.get((config.URLBACKEND + "/phone/number"), data);
    console.log(result)
    if (result.data.result) {
        if (result.data.result.length != 0) {
            console.log("dasdsa" + result.data.result)
            errorMessage += "- Datos ya registrado en el sistema"
            errorMessage += "\nNombre: " + result.data.result.ClientName
            errorMessage += "\nNumero: " + result.data.result.Number

            errorBolean = true;
        }
    }

    duplicateDataWarning.value += errorMessage
    console.log(duplicateDataWarning.value)
    return [errorBolean, errorMessage]

}

const validateDocumentTypeDB = async () => {

    let errorMessage = "", errorBolean = false;
    const data = {
        params: {

            documentTypeID: selectionDropdownDocumentType.value.DocumentTypeID,
            documentNumber: inputDocumentNumber.value
        }
    };





    if (selectionDropdownDocumentType.value.length != 0) {
        if (inputDocumentNumber.value != null) {

            console.log(data)

            const result = await axios.get((config.URLBACKEND + "/client/document"), data);
            if (result.data.result) {
                if (result.data.result.length != 0) {
                    console.log(result.data.result)
                    errorMessage += "\n\n- Datos de documento ya registrado en el sistema"
                    errorMessage += "\n\nNombre: " + result.data.result[0].ClientName
                    errorMessage += "\n\nTipo de documento: " + result.data.result[0].DocumentTypeID
                    errorMessage += "\n\nNumero documento: " + result.data.result[0].DocumentNumber

                    errorBolean = true;
                }
            }
        }
    }

    duplicateDataWarning.value += errorMessage

    return [errorBolean, errorMessage]

}

const saveData = async () => {
    //   v-model="SeleccionDropdownTipoDeDocumento"
    ///                     :options="DropdownTipoDeDocumento" optionLabel="NombreTipoDocumento">
    //

    console.log(selectionDropdownDocumentType)



    if (validateSendClient()[0]) {
        dialogCorrectData.value = true
    } else {

        duplicateDataWarning.value = ""
        const [phoneNumberBD, documentTypeBD] = await Promise.all([validatePhoneNumberBD(), validateDocumentTypeDB()]);
        console.log(phoneNumberBD)
        console.log(documentTypeBD)
        if (await phoneNumberBD[0] || await documentTypeBD[0]) {

            dialogValidateDataBD.value = true
        } else {
            validatorCommentSendClient()

            dialogSaveData.value = true
        }

        console.log("ultimo")

    }

    try {



    } catch (error) {

    }

}

const formatDate = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});





const saveDataDB = async () => {


    dataSend.value.clientName = inputClientName.value
    dataSend.value.phoneNumber = inputPhoneNumber.value



    try {
        const result = await axios.post((config.URLBACKEND + "/client"), dataSend.value);


        console.log(result)


        if (result.data.result.clientID) {
            toast.add({ severity: 'success', summary: 'Registro de cliente exitoso', detail: 'Datos Guardado correctamente', life: 8000 });

            triggerUploadImage(result.data.result.clientID);

            dialogSaveData.value = false;

            resetData();
            closeDialogRegisterClient();
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Ocurrio un error else', life: 10000 });
            dialogSaveData.value = false;
        }

    } catch (error) {
        console.log(error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'Ocurrio un error catch', life: 10000 });
        dialogSaveData.value = false;
    }
}


const searchByDate = async () => {

    console.log(dateStart._rawValue)


    // console.log(DateFechaFinal)



    const dateFormattedStart = convertDate(dateStart._rawValue);
    const dateFormattedEnd = convertDate(dateEnd._rawValue);

    console.log(dateFormattedStart); // Output: 2024-05-27
    console.log(dateFormattedEnd); // Output: 2024-05-27

    if (dateFormattedStart != null) {
        console.log("entro"); // Output: 2024-05-27
        console.log("entro 2"); // Output: 2024-05-27

        clients.value = await DataClientBD(dateFormattedStart, dateFormattedEnd);

    }

}


function convertDate(date) {

    if (!date) {

        return null;
    }
    const dateObject = new Date(date);

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return formatDate(dateObject);
}

const initImage = () => {
    var imageBuffer = Buffer.from(dataSend.value.documentImage)

    // Convierte el buffer a una cadena base64
    const base64Image = imageBuffer.toString('base64');
    //Imagen.value=base64Image
    // Genera la URL base64 para la imagen

    console.log(base64Image)
    image.value = `data:image/jpeg;base64,${base64Image}`;
};
const ViewDataImage = async (client) => {
    clientView.value = client;
    clientView.value.PhoneNumber = parseInt(clientView.value.PhoneNumber);
    clientView.value.DocumentNumber = (clientView.value.DocumentNumber);

    dropdownDocumentType.value.forEach(item => {
        if (clientView.value.DocumentTypeID === item.DocumentTypeID) {
            selectDocumentTypeViewDataImage.value = item;
        }
    });

    const data = {
        params: {
            clientID: clientView.value.ClientID
        }
    };

    let arrayImageTemp = [];

    const responseClient = await axios.get(config.URLBACKEND + "/image/client", data);
    const imageUrls = responseClient.data.result.map(item => item.ImageUrl);

    for (const url of imageUrls) {
        const dataUrlImage = {
            params: {
                UrlImage: url
            }
        };

        const imageResponse = await axios.get(config.URLBACKEND + "/image/show", {
            params: dataUrlImage.params,
            responseType: 'arraybuffer' // Para asegurar que la respuesta es un array buffer
        });

        const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
        arrayImageTemp.push({
            itemImageSrc: `data:image/jpeg;base64,${base64Image}`,
            thumbnailImageSrc: `data:image/jpeg;base64,${base64Image}`,
            alt: 'Descripción de la imagen',
            title: 'Title 4'
        });
    }
    console.log(arrayImageTemp)
    images.value = arrayImageTemp;
    viewDataImageDialog.value = true;
};






const triggerUploadImage = (clientID) => {

    console.log(fileUploadDocumentImage.value)
    console.log(fileUploadDocumentImage.value.files)
    if (fileUploadDocumentImage.value) {
        uploadMultipleFiles(fileUploadDocumentImage.value.files, clientID);
    }
};

const onFileSelectFileUploadImage = (event) => {
    for (let file of event.files) {
        filesImage.value.push({
            name: file.name,
            file: file,
            status: 'Pending'
        });
    }
};

const onClearFileUploadImage = () => {
    fileUploadDocumentImage.value.clear
    filesImage.value = []

};

const uploadFileImage = async (file, clientID, primaryImage) => {
    try {

        const formData = new FormData();
        formData.append('file', file);
        formData.append('clientID', clientID);
        formData.append('primaryImage', primaryImage); // Agregar clientID al FormData

        if (!clientID) {
            toast.add({ severity: 'error', summary: 'Error', detail: `File ${file.name} Problema con ID de cliente y imagen` });

            return
        }
        const response = await axios.post(config.URLBACKEND + "/image/upload", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log(response)

        if (response.status === 200) {
            file.status = 'Completed';
            toast.add({ severity: 'info', summary: 'Success', detail: `File ${file.name} uploaded successfully`, life: 3000 });
        } else {
            file.status = 'Failed';
            toast.add({ severity: 'error', summary: 'Error', detail: `File ${file.name} upload failed`, life: 15000 });
        }
    } catch (error) {
        // file.status = 'Failed';
        toast.add({ severity: 'error', summary: 'Error', detail: `File ${file.name} upload failed`, life: 15000 });
    }
};

const uploadMultipleFiles = async (files, clientID) => {

    console.log(files)
    let i = true
    for (let file of files) {
        if (i = true) {
            await uploadFileImage(file, clientID, true);
            i = false
        } else {
            await uploadFileImage(file, clientID, false);
        }


    }
};


const handleCustomFilterDocumentType = (event) => {

    let tempArray = []
    event.value.forEach(item => {
        tempArray.push(item.DocumentTypeID)

    })
    const value = tempArray;

    if (value.length != 0) {

        //  console.log(productRespaldo.value)

        const tempClients = clientsBackup.value;
        clients.value = tempClients
        const tempArrayClients = [];
        clients.value.forEach(itemClient => {


            if (value.includes(itemClient.DocumentTypeID)) {

                tempArrayClients.push(itemClient)

            }


            //  return item.CategoriaID.toLowerCase().includes(value) || item.CategoriaID.toLowerCase().includes(value);

        });

        const filteredData = tempArrayClients;
        //   filterCallback(filteredData, 'custom', 'CategoriaYCampana');
        //  console.log(productRespaldo.value)
        console.log(filteredData)

        clients.value = filteredData;
        // console.log(productRespaldo.value)

    } else {


        clients.value = clientsBackup.value;
    }


};

const openDialogRegisterClient = () => {

    dialogRegisterClient.value = true;
}

const closeDialogRegisterClient = () => {

    dialogRegisterClient.value = false;
}


</script>

<template>
    <div class="card">

        <div class="grid">

            <div class="col-12">

                <div class="card">
                    <h5>Datos de clientes</h5>
                    <Toolbar class="mb-4">

                        <template v-slot:end>

                            <div class="my-2">

                                <Button label="Nuevo" icon="pi pi-plus" class="mr-2" severity="success"
                                    @click="openDialogRegisterClient" />
                                <Button label="Eliminar" icon="pi pi-trash" severity="danger" @click=""
                                    :disabled="!selectedProducts || !selectedProducts.length" />
                            </div>
                        </template>
                        <template v-slot:start>
                            <FloatLabel>

                                <Calendar v-model="dateStart" class="mr-2" inputId="dateStart" :manualInput="false" />
                                <label for="dateStart">Fecha de inicio</label>
                            </FloatLabel>

                            <FloatLabel>



                                <Calendar v-model="dateEnd" class="mr-2" inputId="dateEnd" :manualInput="false" />
                                <label for="dateEnd">Fecha final</label>
                            </FloatLabel>

                            <Button label="Buscar" icon="pi pi-plus" class="mr-2" severity="success"
                                @click="searchByDate" />

                        </template>


                    </Toolbar>

                    <DataTable ref="dt" :size="size.value" :value="clients" v-model:selection="clientSelection"
                        dataKey="id" :paginator="true" :rows="20" filterDisplay="row" :filters="filtersClient"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        :rowsPerPageOptions="[5, 10, 25, 50, 100]"
                        currentPageReportTemplate="Cliente {first} a {last}, Total {totalRecords} Clientes">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">


                            </div>
                        </template>

                        <!---Column selectionMode="multiple" headerStyle="width:1%; min-width:1rem;">></Column> ---->


                        <Column header="Codigo" :sortable="true" headerStyle="width:1%; min-width:0.11rem;">

                            <template #filter>
                                <InputText class="w-full sm:w-5rem" v-model="filtersClient['ClientID'].value"
                                    placeholder="Buscar codigo..." />

                            </template>
                            <template #body="slotProps">
                                <span class="p-column-title">Code</span>
                                {{ slotProps.data.ClientID }}
                            </template>

                        </Column>


                        <Column field="ClientName" header="Nombre" :sortable="true"
                            headerStyle="width:1%; min-width:15rem;">
                            <template #body="slotProps">
                                <span class="p-column-title">Name</span>
                                {{ slotProps.data.ClientName }}
                            </template>
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText class="w-full sm:w-9rem" v-model="filtersClient['ClientName'].value"
                                    placeholder="Buscar nombre..." />
                            </template>

                        </Column>

                        <Column field="PhoneNumber" header="Telefono" :sortable="true"
                            headerStyle="width:10%; min-width:10rem;">
                            <template #body="slotProps">
                                <span class="p-column-title">Price</span>

                                {{ formatPhoneNumber(slotProps.data.PhoneNumber) }}

                            </template>
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText class="w-full sm:w-8rem" v-model="filtersClient['PhoneNumber'].value"
                                    placeholder="Buscar numero..." />
                            </template>
                        </Column>
                        <Column field="DocumentType" header="Tipo de documento" :showFilterMenu="false" :sortable="true"
                            headerStyle="width:5%; min-width:8rem;">
                            <template #body="slotProps">


                                {{ slotProps.data.DocumentTypeName }}

                            </template>

                            <template #filter="{ filterModel, filterCallback }">
                                <MultiSelect v-model="selectionMultiSelectDocumentType"
                                    :options="multiSelectDocumentType" optionLabel="DocumentTypeName"
                                    placeholder="Tipo de documento..." class="w-full md:w-5rem" style="min-width: 8rem"
                                    filter display="chip" :maxSelectedLabels="3"
                                    @change="handleCustomFilterDocumentType($event)">
                                    <template #option="slotProps">

                                        {{ slotProps.option.DocumentTypeName }}
                                    </template>
                                </MultiSelect>
                            </template>
                        </Column>

                        <Column field="DocumentNumber" header="Numero de documento" :sortable="true"
                            headerStyle="width:10%; min-width:10rem;">
                            <template #body="slotProps">
                                <span class="p-column-title">Price</span>

                                {{ slotProps.data.DocumentNumber }}

                            </template>
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText class="w-full sm:w-8rem" v-model="filtersClient['DocumentNumber'].value"
                                    placeholder="Buscar numero..." />
                            </template>
                        </Column>

                        <Column field="Created" header="Fecha de registro" :sortable="true"
                            headerStyle="width:14%; min-width:10rem;">
                            <template #body="slotProps">
                                <span class="p-column-title">Name</span>
                                {{ slotProps.data.Created }}
                            </template>


                        </Column>
                        <Column headerStyle="min-width:15rem;">
                            <template #body="slotProps">


                                <Button icon="pi pi-id-card" :disabled="slotProps.data.PrimaryImageID === null"
                                    class="mr-2" severity="info" rounded @click="ViewDataImage(slotProps.data)" />

                                <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded
                                    @click="editProduct(slotProps.data)" />
                                <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded
                                    @click="confirmDeleteProduct(slotProps.data)" />
                            </template>
                        </Column>

                        <Dialog v-model:visible="viewDataImageDialog" header="Datos del cliente" :modal="true">


                            <div class="grid">

                                <div class="col-12 md:col-12">


                                    <div class="card p-fluid ">

                                        <br>
                                        <div class="formgrid grid ">
                                            <div class="field col-12 md:col-6">
                                                <FloatLabel>
                                                    <IconField iconPosition="right">
                                                        <InputIcon class="pi pi-search"> </InputIcon>
                                                        <InputText id="inputClientName"
                                                            v-model.trim="clientView.ClientName" type="text"
                                                            :invalid="inputClientNameInvalid"
                                                            @change="functionInputClientName($event)" />
                                                    </IconField>
                                                    <label for="inputClientName">Nombre</label>



                                                </FloatLabel>

                                            </div>

                                            <div class="field col-12 md:col-5">
                                                <FloatLabel>
                                                    <IconField iconPosition="right">

                                                        <InputNumber id="inputPhoneNumber"
                                                            v-model.trim="clientView.PhoneNumber"
                                                            :invalid="inputPhoneNumberInvalid"
                                                            :update="functionInputPhoneNumber()"
                                                            inputId="withoutgrouping" :useGrouping="false" />
                                                        <InputIcon class="pi pi-search"> </InputIcon>
                                                    </IconField>

                                                    <label for="inputPhoneNumber">N° Telefono</label>

                                                </FloatLabel>


                                            </div>

                                        </div>

                                        <Divider />
                                        <br>
                                        <div class="formgrid grid">
                                            <div class="field col-12 md:col-4">
                                                <FloatLabel>

                                                    <Dropdown id="state" v-model="selectDocumentTypeViewDataImage"
                                                        :options="dropdownDocumentType" optionLabel="DocumentTypeName">
                                                    </Dropdown>
                                                    <label for="state">Tipo de Documento</label>
                                                </FloatLabel>
                                            </div>
                                            <div class="field col-12 md:col-4">

                                                <FloatLabel>
                                                    <IconField iconPosition="right">


                                                        <InputText id="inputDocumentNumber"
                                                            v-model.trim="clientView.DocumentNumber"
                                                            inputId="withoutgrouping" :useGrouping="false"
                                                            :invalid="inputDocumentNumberInvalid"
                                                            @change="functionInputDocumentNumber($event)" />
                                                        <InputIcon class="pi pi-search"> </InputIcon>
                                                    </IconField>
                                                    <label for="inputDocumentNumber">N° Documento</label>
                                                </FloatLabel>
                                            </div>

                                        </div>
                                    </div>

                                    <div class="card">
                                        <Galleria :value="images" :responsiveOptions="responsiveOptions" :numVisible="5"
                                            :circular="true" containerStyle="max-width: 640px"
                                            :showItemNavigators="true" :showThumbnails="false">
                                            <template #item="slotProps">
                                                <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt"
                                                    style="width: 400px; height: 400px; display: block;" />
                                            </template>
                                            <template #thumbnail="slotProps">
                                                <img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt"
                                                    style="display: block;" />
                                            </template>
                                        </Galleria>
                                    </div>



                                </div>
                            </div>


                            <template #footer>
                                <Button label="Corregir" icon="pi pi-times" text @click="dialogSaveData = false" />
                                <Button label="Guardar" icon="pi pi-check" text @click="saveDataDB" />
                            </template>
                        </Dialog>

                    </DataTable>

                </div>
            </div>
        </div>
        <div>

            <Dialog v-model:visible="dialogRegisterClient" modal header="Edit Profile" :style="{ width: '100rem' }">
                <div> <!-- Products -->
                    <!-- Contenido específico para Products -->
                    <br>
                    <div class="grid">

                        <div class="col-12 md:col-6">


                            <div class="card p-fluid ">
                                <h5>Datos Cliente Nuevo</h5>
                                <br>
                                <div class="formgrid grid ">
                                    <div class="field col-12 md:col-6">
                                        <FloatLabel>
                                            <IconField iconPosition="right">
                                                <InputIcon class="pi pi-search"> </InputIcon>
                                                <InputText id="inputClientName" v-model="inputClientName" type="text"
                                                    :invalid="inputClientNameInvalid"
                                                    @change="functionInputClientName($event)" />
                                            </IconField>
                                            <label for="inputClientName">Nombre</label>
                                        </FloatLabel>

                                    </div>

                                    <div class="field col-12 md:col-5">
                                        <FloatLabel>
                                            <IconField iconPosition="right">

                                                <InputNumber id="inputPhoneNumber" v-model="inputPhoneNumber"
                                                    :invalid="inputPhoneNumberInvalid"
                                                    :update="functionInputPhoneNumber()" inputId="withoutgrouping"
                                                    :useGrouping="false" />
                                                <InputIcon class="pi pi-search"> </InputIcon>
                                            </IconField>

                                            <label for="inputPhoneNumber">N° Telefono</label>

                                        </FloatLabel>
                                    </div>

                                </div>

                                <Divider />
                                <br>
                                <div class="formgrid grid">
                                    <div class="field col-12 md:col-4">
                                        <FloatLabel>

                                            <Dropdown id="state" v-model="selectionDropdownDocumentType"
                                                :options="dropdownDocumentType" optionLabel="DocumentTypeName">
                                            </Dropdown>
                                            <label for="state">Tipo de Documento</label>
                                        </FloatLabel>
                                    </div>
                                    <div class="field col-12 md:col-4">

                                        <FloatLabel>
                                            <IconField iconPosition="right">


                                                <InputText id="inputDocumentNumber" v-model="inputDocumentNumber"
                                                    inputId="withoutgrouping" :useGrouping="false"
                                                    :invalid="inputDocumentNumberInvalid"
                                                    @change="functionInputDocumentNumber($event)" />
                                                <InputIcon class="pi pi-search"> </InputIcon>
                                            </IconField>
                                            <label for="inputDocumentNumber">N° Documento</label>
                                        </FloatLabel>
                                    </div>

                                </div>


                                <h6>Imagen del documento</h6>

                                <FileUpload name="file" chooseLabel="Buscar" cancelLabel="Cancelar"
                                    ref="fileUploadDocumentImage" @uploader="onUpload" :multiple="true" accept="image/*"
                                    :maxFileSize="1000000" @customUpload="true" :showUploadButton="false" :auto="false"
                                    @select="onFileSelectFileUploadImage" @clear="onClearFileUploadImage">

                                    <template
                                        #content="{ files, uploadedFiles, removeFileCallback, progress, messages }">

                                    </template>
                                    <template #empty>


                                        <p>Arrastra aqui la imagen del documento a subir.</p>
                                    </template>
                                </FileUpload>
                              




                            </div>


                        </div>

                        <div class="col-12 md:col-6">

                            <div class="card p-fluid ">
                                <div class="formgrid grid ">
                                    <div class="field col-12 md:col-6">
                                        <label for="description">Categoria</label>

                                        <div>


                                            <MultiSelect v-model="selectionCategoryGlobal" :options="categoryGlobal"
                                                :disabled="true" optionLabel="CategoryName" placeholder="Categorias..."
                                                filter display="chip" :maxSelectedLabels="3"
                                                @change="handleCustomFilter($event, filterCallback)">
                                            </MultiSelect>




                                        </div>
                                    </div>

                                    <div class="field col-12 md:col-6">
                                        <label for="description">Campaña</label>

                                        <div>


                                            <MultiSelect v-model="selectionCamapaignGlobal" :options="campaignGlobal"
                                                :disabled="true" optionLabel="CampaignName"
                                                placeholder="Selecciona una campaña" filter display="chip"
                                                :maxSelectedLabels="3">


                                                <template #option="slotProps">
                                                    <div class="flex align-items-center gap-2">

                                                        {{ slotProps.option.CampaignName }}

                                                    </div>
                                                </template>
                                            </MultiSelect>
                                        </div>
                                    </div>

                                    <div class="field col-12 md:col-12">
                                        <ScrollPanel style="width: 100%; height:279px" :pt="{
                                            wrapper: {
                                                style: { 'border-right': '10px solid var(--surface-ground)' }
                                            },
                                            bary: 'hover:bg-primary-400 bg-primary-300 opacity-100'
                                        }">


                                            <div class="field col-12 md:col-12"
                                                v-for="(text, index) in selectionCamapaignGlobal" :key="index">
                                                <br>
                                                <FloatLabel>
                                                    <label for="TextAreaConcepto">{{

                                                        selectionCamapaignGlobal[index].CampaignName }}</label>


                                                    <Textarea style="width: 90%; height:80%; " id="TextAreaConcepto"
                                                        v-model.trim="selectionCamapaignGlobal[index].Comment"
                                                        required="true" rows="3" cols="20" />
                                                </FloatLabel>

                                            </div>
                                        </ScrollPanel>


                                    </div>

                                </div>
                            </div>


                        </div>


                        <div class="col-12">

                            <Toolbar class="mb-4">
                                <template v-slot:start>
                                    <div class="my-2">

                                        <Button label="Limpiar Datos" icon="pi pi-trash" severity="danger"
                                            @click="resetData" />
                                    </div>
                                </template>

                                <template v-slot:end>
                                    <Button label="Guardar" icon="pi pi-upload" severity="success" @click="saveData" />
                                </template>
                            </Toolbar>
                        </div>
                     
                    </div>

                    <Dialog v-model:visible="dialogSaveData" :style="{ width: '450px' }"
                        header="Se encontraron las siguiente observaciones" :modal="true">


                        <div class="flex align-items-center justify-content-center">
                            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />


                            <p style="white-space: pre-line;">{{ comment }}</p>

                        </div>
                        <template #footer>
                            <Button label="Corregir" icon="pi pi-times" text @click="dialogSaveData = false" />
                            <Button label="Guardar" icon="pi pi-check" text @click="saveDataDB" />
                        </template>
                    </Dialog>

                    <Dialog v-model:visible="dialogCorrectData" :style="{ width: '450px' }" header="Datos a corregir"
                        :modal="true">


                        <div class="flex align-items-center justify-content-center">
                            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />


                            <p style="white-space: pre-line;">{{ warning }}</p>

                        </div>
                        <template #footer>
                            <Button label="Corregir" icon="pi pi-times" text @click="dialogCorrectData = false" />

                        </template>
                    </Dialog>

                    <Dialog v-model:visible="dialogValidateDataBD" :style="{ width: '450px' }" header="Datos a corregir"
                        :modal="true">


                        <div class="flex align-items-center justify-content-center">
                            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />


                            <p style="white-space: pre-line;">{{ duplicateDataWarning }}</p>

                        </div>
                        <template #footer>
                            <Button label="Corregir" icon="pi pi-times" text @click="dialogValidateDataBD = false" />

                        </template>
                    </Dialog>


                </div>
            </Dialog>
        </div>


    </div>
</template>
