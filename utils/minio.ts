export async function uploadToMinIO(fileURI: string, folder: string) {
    const formData = new FormData()
    formData.append(
        'file',
        {
            uri: fileURI,
            name: 'image.jpg',
            type: 'image/jpeg'
        } as unknown as Blob
    )

    try {
        const response = await fetch(`http://192.168.1.134:3000/api/minio/upload?folder=${folder}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            body: formData
        })

        if (!response.ok) {
            throw new Error('Failed to upload.')
        }

        const data: { url: string } = await response.json()

        return data
    } catch (error) {
        console.error(error)

        return null
    }
}