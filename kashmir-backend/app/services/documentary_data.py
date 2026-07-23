from app.models.schemas import (
    DocumentaryOverview,
    TimelineEvent,
    TimelineResponse,
    TimestampMarker,
    DocumentaryTimestamps,
)
 
 
def get_documentary_overview() -> DocumentaryOverview:
    return DocumentaryOverview(
        title="Kashmir — Fighting for Peace",
        tagline="Two truths. Same sky. Same soil.",
        synopsis=(
            "A feature documentary exploring the human cost of one of the world's longest-running "
            "conflicts. Through seven witnesses — soldiers, mothers, daughters, officers — "
            "Kashmir — Fighting for Peace refuses easy answers. It holds both truths at once: "
            "the armed forces who absorb the risk, and the families who bear the weight of what follows."
        ),
        director="",
        duration_minutes=95,
        release_year=2026,
        trailer_url="",
        poster_url="",
        genres=["Documentary", "Political", "Human Rights"],
    )
 
 
def get_kashmir_timeline() -> TimelineResponse:
    """
    Kashmir roadmap / history timeline.
    Fill in from your chat: https://claude.ai/chat/1bd1b81d-a208-45f0-bab6-3de42ab8216d
    """
    events = [
        TimelineEvent(
            year=1339, title="Shah Mir Dynasty Founded", category="political",
            description="Shah Mir establishes the first Muslim dynasty in Kashmir, marking a cultural shift in the region.",
            lat=34.08, lng=74.79, place="Srinagar",
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Dal_Lake_Hazratbal_Srinagar.jpg/330px-Dal_Lake_Hazratbal_Srinagar.jpg",
        ),
        TimelineEvent(
            year=1586, title="Mughal Conquest", category="political",
            description="Emperor Akbar annexes Kashmir into the Mughal Empire. The region becomes a prized summer retreat.",
            lat=34.09, lng=74.80, place="Srinagar",
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Govardhan._Akbar_With_Lion_and_Calf_ca._1630%2C_Metmuseum_%28cropped%29.jpg/330px-Govardhan._Akbar_With_Lion_and_Calf_ca._1630%2C_Metmuseum_%28cropped%29.jpg",
        ),
        TimelineEvent(
            year=1819, title="Sikh Rule Begins", category="political",
            description="Ranjit Singh's forces conquer Kashmir from the Afghans, beginning Sikh governance.",
            lat=34.08, lng=74.78, place="Kashmir Valley",
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Oval-shaped_tondo_portrait_painting_of_Maharaja_Ranjit_Singh%2C_Lucknow%2C_Awadh%2C_ca.1810%E2%80%9320_%28oval_crop%29.webp/330px-Oval-shaped_tondo_portrait_painting_of_Maharaja_Ranjit_Singh%2C_Lucknow%2C_Awadh%2C_ca.1810%E2%80%9320_%28oval_crop%29.webp.png",
        ),
        TimelineEvent(
            year=1846, title="Treaty of Amritsar", category="political",
            description="The British sell Kashmir to Gulab Singh for 75 lakh rupees. The Dogra dynasty begins.",
            lat=32.73, lng=74.87, place="Jammu",
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Maharaja_Gulab_Singh_of_Jammu_and_Kashmir.jpg/330px-Maharaja_Gulab_Singh_of_Jammu_and_Kashmir.jpg",
        ),
        TimelineEvent(
            year=1947, title="Partition & First Kashmir War", category="conflict",
            description="India and Pakistan gain independence. Tribal invasion leads to Maharaja Hari Singh's accession to India. First India-Pakistan war over Kashmir.",
            lat=34.08, lng=74.79, place="Srinagar",
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Hari_Singh_1931.jpg/330px-Hari_Singh_1931.jpg",
        ),
        TimelineEvent(
            year=1948, title="UN Ceasefire & Resolution", category="political",
            description="UN mediates a ceasefire. Resolution 47 calls for a plebiscite — never conducted.",
            lat=34.05, lng=74.82, place="Kashmir",
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Indian_soldiers_landing_at_Srinagar_airfield_during_the_1947%E2%80%931948_war.jpg/330px-Indian_soldiers_landing_at_Srinagar_airfield_during_the_1947%E2%80%931948_war.jpg",
        ),
        TimelineEvent(
            year=1965, title="Second Kashmir War", category="conflict",
            description="Operation Gibraltar triggers the second India-Pakistan war. Tashkent Agreement restores pre-war positions.",
            lat=34.32, lng=73.88, place="Uri Sector",
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/1965_Indo-Pak_War_DestroyedShermanTank.jpg/330px-1965_Indo-Pak_War_DestroyedShermanTank.jpg",
        ),
        TimelineEvent(
            year=1987, title="Disputed Elections", category="political",
            description="Allegations of rigged state elections fuel widespread disillusionment and radicalization.",
            lat=34.08, lng=74.79, place="Srinagar",
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Kashmir_region._LOC_2003626427_-_showing_sub-regions_administered_by_different_countries.jpg/330px-Kashmir_region._LOC_2003626427_-_showing_sub-regions_administered_by_different_countries.jpg",
        ),
        TimelineEvent(
            year=1989, title="Insurgency Begins", category="conflict",
            description="Armed insurgency erupts in the Kashmir Valley. Tens of thousands of Kashmiri Pandits flee the Valley.",
            lat=34.08, lng=74.80, place="Kashmir Valley",
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Kashmir_region._LOC_2003626427_-_showing_sub-regions_administered_by_different_countries.jpg/330px-Kashmir_region._LOC_2003626427_-_showing_sub-regions_administered_by_different_countries.jpg",
        ),
        TimelineEvent(
            year=1999, title="Kargil War", category="conflict",
            description="Pakistani soldiers and militants infiltrate across the LoC in Kargil. India recaptures positions in a limited war.",
            lat=34.55, lng=76.32, place="Kargil",
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Kargil_war.jpg/330px-Kargil_war.jpg",
        ),
        TimelineEvent(
            year=2008, title="Amarnath Land Row & Mass Protests", category="political",
            description="Dispute over land transfer for Amarnath shrine triggers massive protests across the Valley.",
            lat=34.08, lng=74.79, place="Srinagar",
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Cave_Temple_of_Lord_Amarnath.jpg/330px-Cave_Temple_of_Lord_Amarnath.jpg",
        ),
        TimelineEvent(
            year=2016, title="Burhan Wani's Death & Unrest", category="conflict",
            description="Killing of militant commander Burhan Wani sparks months of curfew, protests, and pellet gun injuries.",
            lat=33.77, lng=75.31, place="South Kashmir",
            image_url="https://upload.wikimedia.org/wikipedia/en/5/5f/Burhan_Wani.jpg",
        ),
        TimelineEvent(
            year=2019, title="Article 370 Revoked", category="political",
            description="Indian government abrogates Article 370, stripping Jammu & Kashmir of special autonomous status and splitting it into two Union Territories.",
            lat=34.08, lng=74.79, place="Srinagar",
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Sansad_Bhavan-2.jpg/330px-Sansad_Bhavan-2.jpg",
        ),
        TimelineEvent(
            year=2024, title="First Elections Post-370", category="political",
            description="Jammu & Kashmir holds its first assembly elections since the revocation of Article 370.",
            lat=34.08, lng=74.80, place="J&K",
            image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Omar_Abdullah%2C_Chief_Minister_of_Jammu_%26_Kashmir.jpg/330px-Omar_Abdullah%2C_Chief_Minister_of_Jammu_%26_Kashmir.jpg",
        ),
    ]
 
    return TimelineResponse(events=events)
 
 
def get_documentary_timestamps() -> DocumentaryTimestamps:
    """
    Chapter markers for the documentary player.
    Maps timestamps to what's happening at that point in the film.
    """
    markers = [
        TimestampMarker(
            timestamp_seconds=0,
            title="Opening — Paradise on Earth",
            description="Aerial shots of Kashmir Valley. Dal Lake at dawn.",
            chapter="Prologue",
        ),
        TimestampMarker(
            timestamp_seconds=180,
            title="Ancient Roots",
            description="Kashmir's Hindu and Buddhist heritage. Temples and monasteries.",
            chapter="Chapter 1: Origins",
        ),
        TimestampMarker(
            timestamp_seconds=600,
            title="The Mughal Era",
            description="Kashmir as the jewel of the Mughal Empire. Gardens of Srinagar.",
            chapter="Chapter 1: Origins",
        ),
        TimestampMarker(
            timestamp_seconds=1200,
            title="Colonial Transaction",
            description="Treaty of Amritsar. Kashmir sold like property.",
            chapter="Chapter 2: Empire & Control",
        ),
        TimestampMarker(
            timestamp_seconds=1800,
            title="1947 — The Great Divide",
            description="Partition, tribal invasion, accession. The wound that never healed.",
            chapter="Chapter 3: Partition",
        ),
        TimestampMarker(
            timestamp_seconds=2700,
            title="Decades of Tension",
            description="Wars of '65 and '71. The militarization of daily life.",
            chapter="Chapter 4: Conflict",
        ),
        TimestampMarker(
            timestamp_seconds=3600,
            title="The Insurgency",
            description="1989 onward. Armed rebellion, exodus, and military crackdown.",
            chapter="Chapter 5: Insurgency",
        ),
        TimestampMarker(
            timestamp_seconds=4500,
            title="Voices of the People",
            description="Interviews with Kashmiris — families, students, shopkeepers.",
            chapter="Chapter 6: Human Stories",
        ),
        TimestampMarker(
            timestamp_seconds=5100,
            title="Article 370 & After",
            description="August 5, 2019. Communication blackout. A new political reality.",
            chapter="Chapter 7: Present Day",
        ),
        TimestampMarker(
            timestamp_seconds=5400,
            title="Epilogue — What Remains",
            description="Closing reflections. Kashmir's unresolved future.",
            chapter="Epilogue",
        ),
        # TODO: Update with actual timestamps from your documentary
    ]
 
    return DocumentaryTimestamps(markers=markers)
 