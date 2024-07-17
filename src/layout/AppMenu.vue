<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Principal',
        items: [{ label: 'Menu Principal', icon: 'pi pi-fw pi-home', to: '' }]
    },
    {
        label: 'Alarma',
        items: [{ label: 'Alarma', icon: 'pi pi-fw pi-home', to: '' }]
    },
    {
        label: 'Tasas',
        items: [{ label: 'Tasas', icon: 'pi pi-fw pi-home', to: '' }]
        
      
    },
    {
        label: 'Bot',
        items: [{ label: 'Bot', icon: 'pi pi-fw pi-home', to: '/pages/Bot' }]
        
      
    },

]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
      
    </ul>
</template>

<style lang="scss" scoped></style>
