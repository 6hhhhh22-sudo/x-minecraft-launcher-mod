// vite.config.ts
import VueI18n from "file:///C:/Users/Admin/Desktop/v3/X-minecraft-launcher/node_modules/.pnpm/@intlify+unplugin-vue-i18n@0.13.0_rollup@2.79.1_vue-i18n-bridge@9.13.1_vue@2.7.16__vue-i18n@8.28.2_vue@2.7.16_/node_modules/@intlify/unplugin-vue-i18n/lib/vite.mjs";
import createVuePlugin from "file:///C:/Users/Admin/Desktop/v3/X-minecraft-launcher/node_modules/.pnpm/@vitejs+plugin-vue2@2.3.3_vite@3.2.11_@types+node@20.12.7_terser@5.20.0__vue@2.7.16/node_modules/@vitejs/plugin-vue2/dist/index.mjs";
import { readdirSync } from "fs";
import { join, resolve } from "path";
import UnoCSS from "file:///C:/Users/Admin/Desktop/v3/X-minecraft-launcher/node_modules/.pnpm/unocss@66.5.1_postcss@8.5.6_vite@3.2.11_@types+node@20.12.7_terser@5.20.0_/node_modules/unocss/dist/vite.mjs";
import AutoImport from "file:///C:/Users/Admin/Desktop/v3/X-minecraft-launcher/node_modules/.pnpm/unplugin-auto-import@0.17.6_@vueuse+core@10.9.0_vue@2.7.16__rollup@2.79.1/node_modules/unplugin-auto-import/dist/vite.js";
import { defineConfig } from "file:///C:/Users/Admin/Desktop/v3/X-minecraft-launcher/node_modules/.pnpm/vite@3.2.11_@types+node@20.12.7_terser@5.20.0/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Admin\\Desktop\\v3\\X-minecraft-launcher\\xmcl-keystone-ui";
var entries = readdirSync(join(__vite_injected_original_dirname, "./src")).filter((f) => f.endsWith(".html")).map((f) => join(__vite_injected_original_dirname, "./src", f));
var vite_config_default = defineConfig({
  server: {
    port: 3e3
  },
  root: join(__vite_injected_original_dirname, "./src"),
  base: "",
  build: {
    rollupOptions: {
      input: entries,
      external: ["electron"]
    },
    minify: "terser",
    sourcemap: true,
    terserOptions: {
      keep_classnames: true,
      keep_fnames: true
    },
    outDir: resolve(__vite_injected_original_dirname, "./dist"),
    assetsInlineLimit: 0
  },
  define: {},
  resolve: {
    alias: {
      undici: "undici-shim",
      "@": join(__vite_injected_original_dirname, "./src"),
      "~main": join(__vite_injected_original_dirname, "./src/windows/main"),
      "~logger": join(__vite_injected_original_dirname, "./src/windows/logger"),
      "~setup": join(__vite_injected_original_dirname, "./src/windows/setup"),
      "@vue/composition-api": "vue",
      "vue-i18n-bridge": "vue-i18n-bridge/dist/vue-i18n-bridge.runtime.esm-bundler.js"
    }
  },
  optimizeDeps: {
    exclude: ["electron", "@xmcl/utils", "@xmcl/resource"],
    esbuildOptions: {
      minify: false,
      keepNames: true
    }
  },
  plugins: [
    createVuePlugin(),
    UnoCSS(),
    VueI18n({
      include: [
        resolve(__vite_injected_original_dirname, "locales/**")
      ],
      esm: true,
      strictMessage: false,
      bridge: false
    }),
    AutoImport({
      imports: [
        "vue",
        {
          "vue-i18n-bridge": [
            "useI18n"
          ],
          "vue-router/composables": [
            "useRouter",
            "useRoute"
          ]
        }
      ],
      dts: "auto-imports.d.ts",
      exclude: ["node_modules", /xmcl\/packages.+/],
      eslintrc: {
        enabled: true,
        filepath: "./.eslintrc-auto-import.json",
        globalsPropValue: true
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pblxcXFxEZXNrdG9wXFxcXHYzXFxcXFgtbWluZWNyYWZ0LWxhdW5jaGVyXFxcXHhtY2wta2V5c3RvbmUtdWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEFkbWluXFxcXERlc2t0b3BcXFxcdjNcXFxcWC1taW5lY3JhZnQtbGF1bmNoZXJcXFxceG1jbC1rZXlzdG9uZS11aVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvQWRtaW4vRGVza3RvcC92My9YLW1pbmVjcmFmdC1sYXVuY2hlci94bWNsLWtleXN0b25lLXVpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IFZ1ZUkxOG4gZnJvbSAnQGludGxpZnkvdW5wbHVnaW4tdnVlLWkxOG4vdml0ZSdcbmltcG9ydCBjcmVhdGVWdWVQbHVnaW4gZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlMidcbmltcG9ydCB7IHJlYWRkaXJTeW5jIH0gZnJvbSAnZnMnXG5pbXBvcnQgeyBqb2luLCByZXNvbHZlIH0gZnJvbSAncGF0aCdcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCJcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcblxuY29uc3QgZW50cmllcyA9IHJlYWRkaXJTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi9zcmMnKSlcbiAgLmZpbHRlcigoZikgPT4gZi5lbmRzV2l0aCgnLmh0bWwnKSlcbiAgLm1hcCgoZikgPT4gam9pbihfX2Rpcm5hbWUsICcuL3NyYycsIGYpKVxuXG4vKipcbiAqIFZpdGUgc2hhcmVkIGNvbmZpZywgYXNzaWduIGFsaWFzIGFuZCByb290IGRpclxuICovXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICB9LFxuICByb290OiBqb2luKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gIGJhc2U6ICcnLCAvLyBoYXMgdG8gc2V0IHRvIGVtcHR5IHN0cmluZyBzbyB0aGUgaHRtbCBhc3NldHMgcGF0aCB3aWxsIGJlIHJlbGF0aXZlXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgaW5wdXQ6IGVudHJpZXMsXG4gICAgICBleHRlcm5hbDogWydlbGVjdHJvbiddLFxuICAgIH0sXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgdGVyc2VyT3B0aW9uczoge1xuICAgICAga2VlcF9jbGFzc25hbWVzOiB0cnVlLFxuICAgICAga2VlcF9mbmFtZXM6IHRydWUsXG4gICAgfSxcbiAgICBvdXREaXI6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9kaXN0JyksXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDAsXG4gIH0sXG4gIGRlZmluZToge1xuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIHVuZGljaTogJ3VuZGljaS1zaGltJyxcbiAgICAgICdAJzogam9pbihfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgICAgJ35tYWluJzogam9pbihfX2Rpcm5hbWUsICcuL3NyYy93aW5kb3dzL21haW4nKSxcbiAgICAgICd+bG9nZ2VyJzogam9pbihfX2Rpcm5hbWUsICcuL3NyYy93aW5kb3dzL2xvZ2dlcicpLFxuICAgICAgJ35zZXR1cCc6IGpvaW4oX19kaXJuYW1lLCAnLi9zcmMvd2luZG93cy9zZXR1cCcpLFxuICAgICAgJ0B2dWUvY29tcG9zaXRpb24tYXBpJzogJ3Z1ZScsXG4gICAgICAndnVlLWkxOG4tYnJpZGdlJzpcbiAgICAgICAgJ3Z1ZS1pMThuLWJyaWRnZS9kaXN0L3Z1ZS1pMThuLWJyaWRnZS5ydW50aW1lLmVzbS1idW5kbGVyLmpzJyxcbiAgICB9LFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2VsZWN0cm9uJywgJ0B4bWNsL3V0aWxzJywgJ0B4bWNsL3Jlc291cmNlJ10sXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgIG1pbmlmeTogZmFsc2UsXG4gICAgICBrZWVwTmFtZXM6IHRydWUsXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIGNyZWF0ZVZ1ZVBsdWdpbigpLFxuICAgIFVub0NTUygpLFxuICAgIC8vIFdpbmRpQ1NTKHtcbiAgICAvLyAgIGNvbmZpZzoge1xuICAgIC8vICAgICBpbXBvcnRhbnQ6IHRydWUsXG4gICAgLy8gICB9LFxuICAgIC8vICAgc2Nhbjoge1xuICAgIC8vICAgICBkaXJzOiBbam9pbihfX2Rpcm5hbWUsICcuL3NyYycpXSxcbiAgICAvLyAgICAgZmlsZUV4dGVuc2lvbnM6IFsndnVlJywgJ3RzJ10sXG4gICAgLy8gICB9LFxuICAgIC8vIH0pLFxuXG4gICAgVnVlSTE4bih7XG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgIHJlc29sdmUoX19kaXJuYW1lLCAnbG9jYWxlcy8qKicpLFxuICAgICAgXSxcbiAgICAgIGVzbTogdHJ1ZSxcbiAgICAgIHN0cmljdE1lc3NhZ2U6IGZhbHNlLFxuICAgICAgYnJpZGdlOiBmYWxzZSxcbiAgICB9KSxcblxuICAgIEF1dG9JbXBvcnQoe1xuICAgICAgaW1wb3J0czogW1xuICAgICAgICAndnVlJyxcbiAgICAgICAge1xuICAgICAgICAgICd2dWUtaTE4bi1icmlkZ2UnOiBbXG4gICAgICAgICAgICAndXNlSTE4bicsXG4gICAgICAgICAgXSxcbiAgICAgICAgICAndnVlLXJvdXRlci9jb21wb3NhYmxlcyc6IFtcbiAgICAgICAgICAgICd1c2VSb3V0ZXInLFxuICAgICAgICAgICAgJ3VzZVJvdXRlJyxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGR0czogJ2F1dG8taW1wb3J0cy5kLnRzJyxcbiAgICAgIGV4Y2x1ZGU6IFsnbm9kZV9tb2R1bGVzJywgL3htY2xcXC9wYWNrYWdlcy4rL10sXG4gICAgICBlc2xpbnRyYzoge1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICBmaWxlcGF0aDogJy4vLmVzbGludHJjLWF1dG8taW1wb3J0Lmpzb24nLCAvLyBEZWZhdWx0IGAuLy5lc2xpbnRyYy1hdXRvLWltcG9ydC5qc29uYFxuICAgICAgICBnbG9iYWxzUHJvcFZhbHVlOiB0cnVlLCAvLyBEZWZhdWx0IGB0cnVlYCwgKHRydWUgfCBmYWxzZSB8ICdyZWFkb25seScgfCAncmVhZGFibGUnIHwgJ3dyaXRhYmxlJyB8ICd3cml0ZWFibGUnKVxuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZYLE9BQU8sYUFBYTtBQUNqWixPQUFPLHFCQUFxQjtBQUM1QixTQUFTLG1CQUFtQjtBQUM1QixTQUFTLE1BQU0sZUFBZTtBQUU5QixPQUFPLFlBQVk7QUFDbkIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUyxvQkFBb0I7QUFQN0IsSUFBTSxtQ0FBbUM7QUFTekMsSUFBTSxVQUFVLFlBQVksS0FBSyxrQ0FBVyxPQUFPLENBQUMsRUFDakQsT0FBTyxDQUFDLE1BQU0sRUFBRSxTQUFTLE9BQU8sQ0FBQyxFQUNqQyxJQUFJLENBQUMsTUFBTSxLQUFLLGtDQUFXLFNBQVMsQ0FBQyxDQUFDO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxNQUFNLEtBQUssa0NBQVcsT0FBTztBQUFBLEVBQzdCLE1BQU07QUFBQSxFQUNOLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLE9BQU87QUFBQSxNQUNQLFVBQVUsQ0FBQyxVQUFVO0FBQUEsSUFDdkI7QUFBQSxJQUNBLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNiLGlCQUFpQjtBQUFBLE1BQ2pCLGFBQWE7QUFBQSxJQUNmO0FBQUEsSUFDQSxRQUFRLFFBQVEsa0NBQVcsUUFBUTtBQUFBLElBQ25DLG1CQUFtQjtBQUFBLEVBQ3JCO0FBQUEsRUFDQSxRQUFRLENBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLEtBQUssS0FBSyxrQ0FBVyxPQUFPO0FBQUEsTUFDNUIsU0FBUyxLQUFLLGtDQUFXLG9CQUFvQjtBQUFBLE1BQzdDLFdBQVcsS0FBSyxrQ0FBVyxzQkFBc0I7QUFBQSxNQUNqRCxVQUFVLEtBQUssa0NBQVcscUJBQXFCO0FBQUEsTUFDL0Msd0JBQXdCO0FBQUEsTUFDeEIsbUJBQ0U7QUFBQSxJQUNKO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLFlBQVksZUFBZSxnQkFBZ0I7QUFBQSxJQUNyRCxnQkFBZ0I7QUFBQSxNQUNkLFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxJQUNiO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsZ0JBQWdCO0FBQUEsSUFDaEIsT0FBTztBQUFBLElBV1AsUUFBUTtBQUFBLE1BQ04sU0FBUztBQUFBLFFBQ1AsUUFBUSxrQ0FBVyxZQUFZO0FBQUEsTUFDakM7QUFBQSxNQUNBLEtBQUs7QUFBQSxNQUNMLGVBQWU7QUFBQSxNQUNmLFFBQVE7QUFBQSxJQUNWLENBQUM7QUFBQSxJQUVELFdBQVc7QUFBQSxNQUNULFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFVBQ0UsbUJBQW1CO0FBQUEsWUFDakI7QUFBQSxVQUNGO0FBQUEsVUFDQSwwQkFBMEI7QUFBQSxZQUN4QjtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLEtBQUs7QUFBQSxNQUNMLFNBQVMsQ0FBQyxnQkFBZ0Isa0JBQWtCO0FBQUEsTUFDNUMsVUFBVTtBQUFBLFFBQ1IsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLFFBQ1Ysa0JBQWtCO0FBQUEsTUFDcEI7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
