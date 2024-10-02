FROM rust:alpine3.20 as builder
ENV SQLX_OFFLINE=true
WORKDIR /app
RUN apk add musl-dev
RUN apk add --no-cache ca-certificates
COPY . .
COPY .sqlx .sqlx
RUN cargo build --release

FROM scratch
USER 1000:1000
COPY --from=builder --chown=1000:1000 /app/target/release/backend /backend
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

EXPOSE 5500
ENTRYPOINT [ "/backend" ]
