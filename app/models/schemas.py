from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class DocumentaryOverview(BaseModel):
    title: str
    tagline: str
    synopsis: str
    director: str
    duration_minutes: int
    release_year: int
    trailer_url: str
    poster_url: str
    genres: list[str]
class TimelineEvent(BaseModel):
    year: int
    title: str
    description: str
    category: str
    image_url: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    place: Optional[str] = None

class TimelineResponse(BaseModel):
    events:list[TimelineEvent]

class TimestampMarker(BaseModel):
    timestamp_seconds: int
    title: str
    description: str
    chapter: Optional[str] = None

class DocumentaryTimestamps(BaseModel):
    markers: list[TimestampMarker]

class SocialPost(BaseModel):
    platform: str 
    author: str
    author_handle: str
    author_avatar: Optional[str] = None
    content: str
    media_url: Optional[str] = None
    post_url: str
    likes: int = 0
    comments: int = 0
    shares: int = 0
    posted_at: Optional[datetime] = None
 
 
class SocialFeedResponse(BaseModel):
    posts: list[SocialPost]
    last_updated: datetime
    total: int

class NewsItem(BaseModel):
    headline: str
    brief: str 
    source_name: str
    source_url: str
    image_url: Optional[str] = None
    published_at: Optional[datetime] = None
    category: Optional[str] = None 
 
 
class NewsFeedResponse(BaseModel):
    articles: list[NewsItem]
    last_updated: datetime
class PaymentCreateRequest(BaseModel):
    email: str
    name: str
 
 
class PaymentCreateResponse(BaseModel):
    order_id: str
    amount: int  
    currency: str
    razorpay_key_id: str
 
 
class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
 
 
class PaymentVerifyResponse(BaseModel):
    verified: bool
    access_token: Optional[str] = None
    message: str
 