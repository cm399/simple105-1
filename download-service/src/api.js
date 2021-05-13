"use strict";
var aws = require("aws-sdk");
const s3 = new aws.S3();

var fetch = require("node-fetch").default;
const archiver = require("archiver");
var stream = require("stream");

module.exports.download = async (event, context, callback) => {
  const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split("/");
  var body = JSON.parse(event.body);
  const bucketName = process.env.CACHE_BUCKET;
  const zipFileName = event.requestContext.requestId + ".zip";
  const streamPassThrough = new stream.PassThrough();

  var params = {
    ACL: "public-read",
    Body: streamPassThrough,
    Bucket: bucketName,
    ContentType: "application/zip",
    Key: zipFileName,
  };
  const s3Upload = s3.upload(params, (err, resp) => {
    if (err) {
      console.error(
        `Got error creating stream to s3 ${err.name} ${err.message} ${err.stack}`
      );
      throw err;
    }
  });

  var amplienceDownloadStreams = await Promise.all(
    body["assets"].map(
      (asset_url) =>
        new Promise((_resolve, _reject) => {
          fetch(asset_url).then((response) => {
            response.buffer().then((buffer) => {
              _resolve({
                data: buffer,
                name: `${asset_url.split("/").pop()}`,
                extension: response.headers
                  .get("content-type")
                  .split("/")
                  .pop(),
              });
            });
          });
        })
    )
  ).catch((_err) => {
    throw new Error(_err);
  });

  await new Promise((_resolve, _reject) => {
    var archive = archiver("zip", {
      zlib: { level: 0 },
    });
    archive.on("error", (err) => {
      throw new Error(err);
    });
    s3Upload.on("close", _resolve());
    s3Upload.on("end", _resolve());
    s3Upload.on("error", _reject());

    archive.pipe(streamPassThrough);
    amplienceDownloadStreams.forEach((_itm) => {
      archive.append(_itm.data, { name: _itm.name + "." + _itm.extension });
    });
    archive.finalize();
  }).catch((_err) => {
    throw new Error(_err);
  });
  const origin = event.headers.origin;
  let headers;
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": true,
    };
  } else {
    headers = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Credentials": true,
    };
  }
  var resp = await s3Upload.promise().catch((_err) => {
    console.log("Error Is : " + _err);
    callback(null, {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(
        {
          succeed: 0,
          error: _err.stack,
        },
        null,
        2
      ),
    });
  });
  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(
      {
        succeed: 1,
        location: process.env.ASSETS_URL + zipFileName,
      },
      null,
      2
    ),
  };
};

module.exports.purge = async (event, context, callback) => {
  const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split("/");
  var body = JSON.parse(event.body);
  const objects = body["files"].map((zip_url) => ({
    Key: `${zip_url.split("/").pop()}`,
  }));

  var params = {
    Bucket: process.env.CACHE_BUCKET,
    Delete: {
      Objects: objects,
      Quiet: false,
    },
  };
  const origin = event.headers.origin;
  let headers;
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": true,
    };
  } else {
    headers = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Credentials": true,
    };
  }
  let s3Result = await s3
    .deleteObjects(params)
    .promise()
    .catch((err) => {
      if (err)
        console.error(
          `Got error creating stream to s3 ${err.name} ${err.message} ${err.stack}`
        );
      callback(null, {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(
          {
            succeed: 0,
            error: err.stack,
          },
          null,
          2
        ),
      });
    });
  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(
      {
        succeed: 1,
        data: s3Result,
      },
      null,
      2
    ),
  };
};
