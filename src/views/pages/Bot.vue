<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import config from '../config.js';

const qrCode = ref(null);
const status = ref(null);
const toast = useToast();

const getStatus = async () => {
  try {
    const response = await axios.get(config.URLBACKEND+'/status');
    status.value = response.data.status;
  } catch (error) {
    console.error('Error getting status:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error getting status' });
  }
};

const getQRCode = async () => {
  try {
    getStatus();
    const response = await axios.get(config.URLBACKEND+'/qr');
  
    qrCode.value = response.data.qrCode;
    console.log(qrCode.value)
  } catch (error) {
    console.error('Error getting QR code:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error getting QR code' });
  }
};

const disconnect = async () => {
  try {
    const response = await axios.post(config.URLBACKEND+'/disconnect');
    toast.add({ severity: 'success', summary: 'Disconnected', detail: response.data.message });
  } catch (error) {
    console.error('Error disconnecting:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error disconnecting' });
  }
};

const reinitialize = async () => {
  try {
    const response = await axios.post(config.URLBACKEND+'/reinitialize');
    toast.add({ severity: 'success', summary: 'Reinitialized', detail: response.data.message });
    getQRCode(); // Get the new QR code after reinitialization
  } catch (error) {
    console.error('Error reinitializing:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error reinitializing' });
  }
};

onMounted(() => {
  getStatus();
  getQRCode();
});

onBeforeUnmount(() => {
  // No WebSocket to close
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

    <div v-else-if="qrCode">
      <img :src="qrCode" alt="QR Code" />
    </div>
    <div v-else>
      <p>Waiting for QR code...</p>
    </div>
    <div class="buttons">
      <button @click="disconnect">Disconnect</button>
      <button @click="getQRCode">Generate New QR</button>
    </div>
  </div>
</template>