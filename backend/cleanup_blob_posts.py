"""
Clean up posts with blob: URLs that don't work
"""
from mongodb_config import MongoDBHelper

helper = MongoDBHelper()

# Find posts with blob URLs
posts = helper.find_documents('posts', {})
deleted_count = 0

for post in posts:
    photos = post.get('photos', [])
    if any('blob:' in photo for photo in photos):
        post_id = post.get('_id')
        if post_id:
            helper.delete_document('posts', post_id)
            deleted_count += 1
            print(f"Deleted post: {post.get('author')} - {post.get('content')[:30]}")

print(f"\n✅ Cleaned up {deleted_count} posts with blob URLs")
print("Now upload fresh images and they'll be stored with proper Cloudinary/local URLs")
