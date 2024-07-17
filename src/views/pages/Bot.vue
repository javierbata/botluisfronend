<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { Buffer } from 'buffer';

import axios from 'axios';
import config from '../config.js';
const toast = useToast();



const qrCode = ref(null);
const status = ref(null);

let ws;

const connectWebSocket = () => {
  ws = new WebSocket('ws://localhost:5000/ws');

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'qr') {
      qrCode.value = message.data;
    } else if (message.type === 'status') {
      status.value = message.data;
      if (status.value !== 'authenticated') {
        qrCode.value = null; // Clear QR code if not authenticated
      }
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    toast.add({ severity: 'error', summary: 'WebSocket Error', detail: error.message });
  };
};

const disconnect = async () => {
  try {
    const response = await axios.post('http://localhost:5000/disconnect');
    toast.add({ severity: 'success', summary: 'Disconnected', detail: response.data.message });
  } catch (error) {
    console.error('Error disconnecting:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error disconnecting' });
  }
};

const reinitialize = async () => {
  try {
    const response = await axios.post('http://localhost:5000/reinitialize');
    toast.add({ severity: 'success', summary: 'Reinitialized', detail: response.data.message });
  } catch (error) {
    console.error('Error reinitializing:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error reinitializing' });
  }
};

onMounted(() => {
  connectWebSocket();
});

onBeforeMount(() => {
  if (ws) {
    ws.close();
  }
});


</script>
<template>
  <div class="qr-code-container">
    <h1>Scan QR Code with WhatsApp</h1>
    <div v-if="status === 'authenticated'">
      <p>Client is authenticated! You are connected.</p>
    </div>
    <div v-else-if="status === 'auth_failure'">
      <p>Authentication failed. Please try again.</p>
    </div>
    <div v-else-if="status === 'disconnected'">
      <p>Client was disconnected. Please scan the QR code again.</p>
    </div>
    <div v-else-if="qrCode">
      <img :src="qrCode" alt="QR Code" />
    </div>
    <div v-else>
      <p>Waiting for QR code...</p>
    </div>
    <div class="buttons">
      <button @click="disconnect">Disconnect</button>
      <button @click="reinitialize">Generate New QR</button>
    </div>
  </div>
</template>