<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'

const EU_ALLERGENS = [
  'Gluten', 'Kräftdjur', 'Ägg', 'Fisk', 'Jordnötter', 'Soja',
  'Mjölk', 'Nötter', 'Selleri', 'Senap', 'Sesamfrön', 'Sulfiter', 'Lupin', 'Blötdjur',
]

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  sort_order: number
  ingredients: string | null
  allergens: string[]
  is_featured: boolean
}

interface FormState {
  name: string
  price: string
  image_url: string
  sort_order: number
  ingredients: string
  allergens: string[]
  is_featured: boolean
}

const products = ref<Product[]>([])
const loading = ref(true)
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = ref<FormState>({ name: '', price: '', image_url: '', sort_order: 0, ingredients: '', allergens: [], is_featured: false })
const imageFile = ref<File | null>(null)
const imagePreview = ref('')
const uploadingImage = ref(false)
const deleteConfirmId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const deleteErrorMsg = ref('')

async function loadProducts() {
  loading.value = true
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
  products.value = data ?? []
  loading.value = false
}

onMounted(loadProducts)

function openAdd() {
  editingId.value = null
  form.value = { name: '', price: '', image_url: '', sort_order: products.value.length + 1, ingredients: '', allergens: [], is_featured: false }
  imageFile.value = null
  imagePreview.value = ''
  errorMsg.value = ''
  showModal.value = true
}

function openEdit(p: Product) {
  editingId.value = p.id
  form.value = {
    name: p.name,
    price: String(p.price),
    image_url: p.image_url,
    sort_order: p.sort_order,
    ingredients: p.ingredients ?? '',
    allergens: [...(p.allergens ?? [])],
    is_featured: p.is_featured,
  }
  imageFile.value = null
  imagePreview.value = p.image_url
  errorMsg.value = ''
  showModal.value = true
}

async function toggleFeatured(p: Product) {
  p.is_featured = !p.is_featured
  await supabase.from('products').update({ is_featured: p.is_featured }).eq('id', p.id)
}

function closeModal() {
  showModal.value = false
  editingId.value = null
}

function toggleAllergen(allergen: string) {
  const idx = form.value.allergens.indexOf(allergen)
  if (idx === -1) form.value.allergens.push(allergen)
  else form.value.allergens.splice(idx, 1)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

async function uploadImage(): Promise<string | null> {
  if (!imageFile.value) return null
  uploadingImage.value = true
  const ext = imageFile.value.name.split('.').pop()
  const path = `${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, imageFile.value, { upsert: true })
  uploadingImage.value = false
  if (error) { errorMsg.value = 'Bilduppladdning misslyckades: ' + error.message; return null }
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

async function saveProduct() {
  errorMsg.value = ''
  if (!form.value.name.trim() || !form.value.price) {
    errorMsg.value = 'Namn och pris krävs.'
    return
  }
  saving.value = true

  let imageUrl = form.value.image_url
  if (imageFile.value) {
    const uploaded = await uploadImage()
    if (!uploaded) { saving.value = false; return }
    imageUrl = uploaded
  }
  if (!imageUrl) { errorMsg.value = 'En bild krävs.'; saving.value = false; return }

  const payload = {
    name: form.value.name.trim(),
    price: parseFloat(form.value.price),
    image_url: imageUrl,
    sort_order: form.value.sort_order,
    ingredients: form.value.ingredients.trim() || null,
    allergens: form.value.allergens,
    is_featured: form.value.is_featured,
  }

  const { error } = editingId.value
    ? await supabase.from('products').update(payload).eq('id', editingId.value)
    : await supabase.from('products').insert(payload)

  saving.value = false
  if (error) { errorMsg.value = error.message; return }

  successMsg.value = editingId.value ? 'Produkt uppdaterad!' : 'Produkt tillagd!'
  setTimeout(() => (successMsg.value = ''), 3000)
  closeModal()
  await loadProducts()
}

async function deleteProduct(id: string) {
  deletingId.value = id
  deleteErrorMsg.value = ''

  const product = products.value.find(p => p.id === id)

  if (product?.image_url) {
    try {
      const url = new URL(product.image_url)
      const parts = url.pathname.split('/product-images/')
      if (parts.length > 1) {
        const filePath = decodeURIComponent(parts[1])
        await supabase.storage.from('product-images').remove([filePath])
      }
    } catch {
      // bild-URL ogiltig, fortsätt ändå
    }
  }

  const { error } = await supabase.from('products').delete().eq('id', id)
  deletingId.value = null

  if (error) {
    deleteErrorMsg.value = error.message
    return
  }

  deleteConfirmId.value = null
  await loadProducts()
}
</script>

<template>
  <div class="products-page">
    <div class="products-header">
      <div>
        <h1 class="products-title">Produkter</h1>
        <p class="products-sub">Hantera varor som visas i "Våra bakvärk"</p>
      </div>
      <button class="btn-primary" @click="openAdd">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Lägg till produkt
      </button>
    </div>

    <p v-if="successMsg" class="toast-success">{{ successMsg }}</p>
    <p v-if="deleteErrorMsg" class="toast-error">{{ deleteErrorMsg }}</p>

    <div v-if="loading" class="products-loading"><div class="spinner" /></div>

    <div v-else class="products-table-wrap">
      <table class="products-table">
        <thead>
          <tr>
            <th>Favorit</th>
            <th>Bild</th>
            <th>Namn</th>
            <th>Pris</th>
            <th>Allergener</th>
            <th>Ordning</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td class="td-featured">
              <button
                class="featured-toggle"
                :class="{ 'featured-toggle--on': p.is_featured }"
                :title="p.is_featured ? 'Ta bort från favoriter' : 'Lägg till i favoriter'"
                @click="toggleFeatured(p)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </button>
            </td>
            <td><img :src="p.image_url" :alt="p.name" class="table-img" /></td>
            <td class="td-name">
              {{ p.name }}
              <p v-if="p.ingredients" class="td-ingredients">{{ p.ingredients }}</p>
            </td>
            <td>{{ p.price }} kr</td>
            <td>
              <div class="allergen-tags">
                <span v-for="a in p.allergens" :key="a" class="allergen-tag">{{ a }}</span>
                <span v-if="!p.allergens?.length" class="no-allergens">—</span>
              </div>
            </td>
            <td>{{ p.sort_order }}</td>
            <td class="td-actions">
              <button class="btn-edit" @click="openEdit(p)">Redigera</button>
              <button v-if="deleteConfirmId !== p.id" class="btn-delete" @click="deleteConfirmId = p.id">Ta bort</button>
              <span v-else class="delete-confirm">
                Säker?
                <button
                  class="btn-delete-confirm"
                  :disabled="deletingId === p.id"
                  @click="deleteProduct(p.id)"
                >
                  <span v-if="deletingId === p.id" class="btn-spinner" />
                  <span v-else>Ja</span>
                </button>
                <button class="btn-cancel-sm" :disabled="deletingId === p.id" @click="deleteConfirmId = null">Nej</button>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingId ? 'Redigera produkt' : 'Ny produkt' }}</h2>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>

        <form class="modal-form" @submit.prevent="saveProduct">
          <!-- Image -->
          <div class="form-field">
            <label>Bild</label>
            <div class="upload-area" @click="($refs.fileInput as HTMLInputElement).click()">
              <img v-if="imagePreview" :src="imagePreview" class="upload-preview" alt="Förhandsgranskning" />
              <div v-else class="upload-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span>Klicka för att ladda upp bild</span>
              </div>
            </div>
            <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
            <p class="field-hint">JPG, PNG, WEBP — max 5 MB</p>
          </div>

          <!-- Name -->
          <div class="form-field">
            <label for="p-name">Namn</label>
            <input id="p-name" v-model="form.name" type="text" placeholder="t.ex. Chokladtårta" required />
          </div>

          <!-- Price -->
          <div class="form-field">
            <label for="p-price">Pris (kr)</label>
            <input id="p-price" v-model="form.price" type="number" min="0" step="0.01" placeholder="0.00" required />
          </div>

          <!-- Ingredients -->
          <div class="form-field">
            <label for="p-ingredients">Ingredienser</label>
            <textarea
              id="p-ingredients"
              v-model="form.ingredients"
              placeholder="t.ex. Vetemjöl, socker, smör, ägg, vanilj..."
              rows="3"
            />
            <p class="field-hint">Lista ingredienser separerade med komma</p>
          </div>

          <!-- Allergens -->
          <div class="form-field">
            <label>Allergener</label>
            <p class="field-hint" style="margin-bottom:10px">Markera de allergener som förekommer i produkten</p>
            <div class="allergen-grid">
              <label
                v-for="allergen in EU_ALLERGENS"
                :key="allergen"
                class="allergen-check"
                :class="{ 'allergen-check--active': form.allergens.includes(allergen) }"
              >
                <input
                  type="checkbox"
                  :checked="form.allergens.includes(allergen)"
                  @change="toggleAllergen(allergen)"
                />
                {{ allergen }}
              </label>
            </div>
          </div>

          <!-- Sort order -->
          <div class="form-field">
            <label for="p-order">Visningsordning</label>
            <input id="p-order" v-model.number="form.sort_order" type="number" min="1" />
          </div>

          <!-- Featured -->
          <label class="featured-form-toggle">
            <input type="checkbox" v-model="form.is_featured" />
            <span class="featured-form-toggle__box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Visa i "Våra favoriter"
            </span>
          </label>

          <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="closeModal">Avbryt</button>
            <button type="submit" class="btn-primary" :disabled="saving || uploadingImage">
              <span v-if="saving || uploadingImage" class="btn-spinner" />
              <span v-else>{{ editingId ? 'Spara ändringar' : 'Lägg till' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Featured star toggle in table */
.td-featured { text-align: center; }

.featured-toggle {
  background: none;
  border: none;
  padding: 4px;
  color: #d1d5db;
  transition: color 0.2s, transform 0.15s;
  line-height: 0;
}
.featured-toggle:hover { color: #f59e0b; transform: scale(1.2); }
.featured-toggle--on { color: #f59e0b; }

/* Featured checkbox in modal form */
.featured-form-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.featured-form-toggle input { display: none; }
.featured-form-toggle__box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray);
  transition: border-color 0.2s, background 0.2s, color 0.2s;
  width: 100%;
}
.featured-form-toggle__box svg { color: #d1d5db; transition: color 0.2s; }
.featured-form-toggle input:checked + .featured-form-toggle__box {
  border-color: #f59e0b;
  background: #fffbeb;
  color: #92400e;
  font-weight: 600;
}
.featured-form-toggle input:checked + .featured-form-toggle__box svg { color: #f59e0b; }

.products-page {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.products-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.products-title {
  font-family: var(--font-display);
  font-size: 1.6rem;
  color: var(--dark);
  margin-bottom: 4px;
}
.products-sub { font-size: 0.875rem; color: var(--gray); }

.products-loading { display: flex; justify-content: center; padding: 80px 0; }

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--pink-light);
  border-top-color: var(--pink);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.toast-success {
  background: #f0fdf4;
  color: #166534;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.875rem;
  font-weight: 500;
}

.toast-error {
  background: #fef2f2;
  color: #dc2626;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.875rem;
  font-weight: 500;
}

.products-table-wrap {
  background: var(--white);
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow: auto;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.products-table thead { background: #f8f9fa; }

.products-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray);
  border-bottom: 1px solid #f0f0f0;
  white-space: nowrap;
}

.products-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f8f8f8;
  color: var(--dark);
  vertical-align: middle;
}

.products-table tr:last-child td { border-bottom: none; }

.table-img {
  width: 56px;
  height: 44px;
  object-fit: cover;
  border-radius: 8px;
}

.td-name { font-weight: 600; }

.td-ingredients {
  font-size: 0.75rem;
  color: var(--gray);
  font-weight: 400;
  margin-top: 2px;
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.allergen-tags { display: flex; flex-wrap: wrap; gap: 4px; }

.allergen-tag {
  background: #fff3e0;
  color: #b45309;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 20px;
  white-space: nowrap;
}

.no-allergens { color: var(--gray); font-size: 0.85rem; }

.td-actions { display: flex; align-items: center; gap: 8px; white-space: nowrap; }

.delete-confirm { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--gray); }

/* Buttons */
.btn-primary {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 18px; background: var(--pink); color: white;
  border-radius: 8px; font-weight: 600; font-size: 0.9rem;
  border: none; transition: background 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #c9186e; }
.btn-primary:disabled { opacity: 0.7; }

.btn-secondary {
  padding: 10px 18px; background: #f3f4f6; color: var(--dark);
  border-radius: 8px; font-weight: 600; font-size: 0.9rem;
  border: none; transition: background 0.2s;
}
.btn-secondary:hover { background: #e5e7eb; }

.btn-edit {
  padding: 6px 12px; background: #f3f4f6; border-radius: 6px;
  font-size: 0.8rem; font-weight: 600; border: none; color: var(--dark); transition: background 0.2s;
}
.btn-edit:hover { background: #e5e7eb; }

.btn-delete {
  padding: 6px 12px; background: #fef2f2; border-radius: 6px;
  font-size: 0.8rem; font-weight: 600; border: none; color: #dc2626; transition: background 0.2s;
}
.btn-delete:hover { background: #fee2e2; }

.btn-delete-confirm {
  padding: 4px 10px; background: #dc2626; color: white;
  border-radius: 6px; font-size: 0.78rem; font-weight: 600; border: none;
  display: inline-flex; align-items: center; justify-content: center; min-width: 32px;
}
.btn-delete-confirm:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-delete-confirm .btn-spinner {
  border-color: rgba(255,255,255,0.4);
  border-top-color: white;
}

.btn-cancel-sm {
  padding: 4px 10px; background: #f3f4f6; color: var(--dark);
  border-radius: 6px; font-size: 0.78rem; font-weight: 600; border: none;
}

.btn-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
  border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block;
}

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: 24px;
}

.modal {
  background: var(--white); border-radius: 16px;
  width: 100%; max-width: 520px; max-height: 90vh;
  overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #f0f0f0;
  position: sticky; top: 0; background: var(--white); z-index: 1;
}

.modal-header h2 { font-family: var(--font-display); font-size: 1.2rem; color: var(--dark); }

.modal-close {
  background: none; border: none; font-size: 1rem; color: var(--gray);
  padding: 4px 8px; border-radius: 4px; transition: background 0.2s;
}
.modal-close:hover { background: #f3f4f6; }

.modal-form { padding: 24px; display: flex; flex-direction: column; gap: 20px; }

.form-field { display: flex; flex-direction: column; gap: 6px; }

.form-field label { font-size: 0.875rem; font-weight: 600; color: var(--dark); }

.form-field input,
.form-field textarea {
  padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px;
  font-size: 0.95rem; font-family: var(--font-body); color: var(--dark);
  outline: none; transition: border-color 0.2s; resize: vertical;
}
.form-field input:focus,
.form-field textarea:focus { border-color: var(--pink); }

.field-hint { font-size: 0.75rem; color: var(--gray); }

/* Upload */
.upload-area {
  border: 2px dashed #e5e7eb; border-radius: 10px; min-height: 140px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; overflow: hidden; transition: border-color 0.2s;
}
.upload-area:hover { border-color: var(--pink); }

.upload-preview { width: 100%; height: 160px; object-fit: cover; }

.upload-placeholder {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; color: var(--gray); padding: 20px; text-align: center; font-size: 0.875rem;
}

/* Allergen grid */
.allergen-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.allergen-check {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  user-select: none;
}

.allergen-check input { display: none; }

.allergen-check--active {
  border-color: #f59e0b;
  background: #fffbeb;
  color: #92400e;
  font-weight: 600;
}

.allergen-check:not(.allergen-check--active):hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.form-error {
  font-size: 0.875rem; color: #dc2626; background: #fef2f2;
  border-radius: 8px; padding: 10px 14px;
}

.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px; padding-top: 8px;
}

@media (max-width: 600px) {
  .products-page { padding: 16px; }
  .allergen-grid { grid-template-columns: 1fr; }
}
</style>
