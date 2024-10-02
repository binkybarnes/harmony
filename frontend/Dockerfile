FROM node:18 as builder
ARG VITE_CLOUDFRONT_IMAGE_URL
ARG VITE_API_URL
ENV VITE_CLOUDFRONT_IMAGE_URL=$VITE_CLOUDFRONT_IMAGE_URL
ENV VITE_API_URL=$VITE_API_URL
WORKDIR /app
COPY package*.json .

RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]


# docker build \                                                                                                                                                               (base) 
# --build-arg VITE_CLOUDFRONT_IMAGE_URL=d2fk3ssa9pe12k.cloudfront.net \
# --build-arg VITE_API_URL=https://harmonyapp.xyz:5500 \
# -t binkybarnes/harmony-frontend .