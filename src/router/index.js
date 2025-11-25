import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue' 
import ListProduct from '@/views/ListProduct.vue'
import AddProduct from '@/views/AddProduct.vue'
import EditProduct from '@/views/EditProduct.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import ManageTask from '@/views/ManageTask.vue'
import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs'
const routes = [
  { path: '/', redirect: '/home' },
  { path: '/list', component: ListProduct },
  { path: '/add', component: AddProduct },
  { path: '/edit/:id', component: EditProduct, props: true },
  { path: '/home', component: Home },
  {path:'/productdetail',component:ProductDetail},
  {path:'/managetask',component:ManageTask}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
