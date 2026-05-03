# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy root config files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install dependencies
RUN npm install

# Copy libs and web app
COPY libs ./libs
COPY web ./web

# Build the app using Nx
RUN npx nx build ngrx-crud --configuration development

# Run stage
FROM nginx:alpine
COPY --from=build /app/dist/web/browser /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
