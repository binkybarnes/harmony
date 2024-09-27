use aws_sdk_s3::primitives::ByteStream;
use aws_sdk_s3::Client;

pub async fn upload_to_s3(
    aws_client: &Client,
    folder: &str,
    key: &str,
    byte_stream: ByteStream,
) -> Result<(), aws_sdk_s3::Error> {
    let s3_bucket: String = dotenv::var("S3_IMAGE_BUCKET")
        .expect("set S3_IMAGE_BUCKET in .env")
        .parse::<String>()
        .unwrap();

    aws_client
        .put_object()
        .bucket(s3_bucket)
        .key(format!("{}/{}", folder, key))
        .body(byte_stream)
        .send()
        .await?;

    Ok(())
}

pub async fn remove_from_s3(
    aws_client: &Client,
    folder: &str,
    key: &str,
) -> Result<(), aws_sdk_s3::Error> {
    let s3_bucket: String = dotenv::var("S3_IMAGE_BUCKET")
        .expect("set S3_IMAGE_BUCKET in .env")
        .parse::<String>()
        .unwrap();

    aws_client
        .delete_object()
        .bucket(s3_bucket)
        .key(format!("{}/{}", folder, key))
        .send()
        .await?;

    Ok(())
}
