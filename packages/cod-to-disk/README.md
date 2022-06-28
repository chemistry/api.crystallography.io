# @chemistry/cod-to-disk

Synchronize information from COD database and store to disk

## Commands

Build Container

```bash
cd ../../../ && docker build -t gcr.io/crystallography-io/cod-to-disk -f packages/containers/cod-to-disk/Dockerfile .
```

Execute container

```bash
docker run --rm --name cod-to-disk gcr.io/crystallography-io/cod-to-disk
```

## Local Commands

* Build project: `npm run build`
