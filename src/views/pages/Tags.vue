<script setup>

import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import config from '../config.js';

const products = ref();
const editingRows = ref([]);
const dataTags = ref();

onMounted(() => {
    
});

const onRowEditSave = (event) => {
    let { newData, index } = event;

    products.value[index] = newData;
};

const getDataTags = async () => {

    const responseClient = await axios.get(config.URLBACKEND + "/tags/all");
    dataClients = responseClient.data.result;

}



</script>

<template>
    <ThemeSwitcher />
    <div class="card">
        <DataTable v-model:editingRows="editingRows" :value="products" editMode="row" dataKey="id" @row-edit-save="onRowEditSave"
            :pt="{
                table: { style: 'min-width: 50rem' },
                column: {
                    bodycell: ({ state }) => ({
                        style:  state['d_editing']&&'padding-top: 0.75rem; padding-bottom: 0.75rem'
                    })
                }
            }"
        >
            <Column field="code" header="Code" style="width: 20%">
                <template #editor="{ data, field }">
                    <InputText v-model="data[field]" fluid />
                </template>
            </Column>
            <Column field="name" header="Name" style="width: 20%">
                <template #editor="{ data, field }">
                    <InputText v-model="data[field]" fluid />
                </template>
            </Column>
            <Column field="inventoryStatus" header="Status" style="width: 20%">
                <template #editor="{ data, field }">
                    <Select v-model="data[field]" :options="statuses" optionLabel="label" optionValue="value" placeholder="Select a Status" fluid>
                        <template #option="slotProps">
                            <Tag :value="slotProps.option.value" :severity="getStatusLabel(slotProps.option.value)" />
                        </template>
                    </Select>
                </template>
                <template #body="slotProps">
                    <Tag :value="slotProps.data.inventoryStatus" :severity="getStatusLabel(slotProps.data.inventoryStatus)" />
                </template>
            </Column>
            <Column field="price" header="Price" style="width: 20%">
                <template #body="{ data, field }">
                    {{ formatCurrency(data[field]) }}
                </template>
                <template #editor="{ data, field }">
                    <InputNumber v-model="data[field]" mode="currency" currency="USD" locale="en-US" fluid />
                </template>
            </Column>
            <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
        </DataTable>
    </div>
</template>
