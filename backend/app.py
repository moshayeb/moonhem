from datetime import date
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from backend.schemas import (
    ListingCreate,
    UserCreate,
    UserRegister,
    CompanyCreate,
    AddressCreate,
    FeatureCreate,
    ListingPriceUpdate,
    ListingStatusUpdate,
    MessageCreate,
)

from fastapi import Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware

from backend.auth_utils import authenticate_user, get_user_by_email, user_without_password
from backend.config import settings
from backend.deps import get_db
from backend.passwords import hash_password
from backend.db import (
    create_listing,
    delete_listing,
    update_listing,
    get_listings_full,
    get_one_listing_full,
    get_all_users,
    create_user,
    create_address,
    get_role_id_by_name,
    get_one_user,
    delete_user,
    update_user,
    get_all_companies,
    get_one_company,
    create_company,
    delete_company,
    update_company,
    get_all_addresses,
    get_one_address,
    delete_address,
    update_address,
    get_all_features,
    get_one_feature,
    create_feature,
    delete_feature,
    update_feature,
    update_listing_price,
    update_listing_status,
    create_message,
    get_messages_for_listing,
    get_messages_for_user,
)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "moonhem-api"}


@app.get("/health/db")
def health_database():
    """Check `.env` database settings and TCP connection (no full schema check)."""
    from backend.database import get_connection

    if not settings.database_name or not settings.database_password:
        return JSONResponse(
            status_code=503,
            content={
                "ok": False,
                "reason": "missing_env",
                "hint": "Set DATABASE_NAME and PASSWORD in a `.env` file at the project root (see `.env.example`).",
            },
        )
    try:
        con = get_connection()
        try:
            with con.cursor() as cur:
                cur.execute("SELECT 1")
            return {"ok": True, "database": "reachable"}
        finally:
            con.close()
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"ok": False, "reason": "connection_failed", "error": str(e)},
        )


security = HTTPBasic()


@app.post("/login")
def login(
    credentials: HTTPBasicCredentials = Depends(security),
    con=Depends(get_db),
):
    return {"user": authenticate_user(con, credentials)}


@app.get("/me")
def read_me(
    credentials: HTTPBasicCredentials = Depends(security),
    con=Depends(get_db),
):
    """Return the current user when valid Basic credentials are stored client-side."""
    return {"user": authenticate_user(con, credentials)}


@app.post("/register")
def register_public_user(body: UserRegister, con=Depends(get_db)):
    """Create a buyer account (role User). Uses a placeholder address until the profile is completed."""
    mail = body.mail.strip().lower()
    if get_user_by_email(con, mail):
        raise HTTPException(status_code=400, detail="That email is already registered.")
    role_id = get_role_id_by_name(con, "User")
    if role_id is None:
        raise HTTPException(
            status_code=503,
            detail="Registration unavailable: database has no 'User' role. Run `python backend/db_setup.py` and seed the database.",
        )
    address_id = create_address(con, "—", "Stockholm", "111 22", "Sweden")
    birth = body.birthdate if body.birthdate is not None else date(1990, 1, 1)
    phone = (body.phone_number or "").strip() or "—"
    new_id = create_user(
        con,
        body.first_name.strip(),
        body.surname.strip(),
        mail,
        hash_password(body.password),
        phone,
        birth,
        role_id,
        address_id,
        None,
    )
    con.commit()
    return {"message": "Account created", "id": new_id}


# This code is for the website.

"""
ADD ENDPOINTS FOR FASTAPI HERE
Make sure to do the following:
- Use the correct HTTP method (e.g get, post, put, delete)
- Use correct STATUS CODES, e.g 200, 400, 401 etc. when returning a result to the user
- Use pydantic models whenever you receive user data and need to validate the structure and data types (VG)
This means you need some error handling that determine what should be returned to the user
Read more: https://www.geeksforgeeks.org/10-most-common-http-status-codes/
- Use correct URL paths the resource, e.g some endpoints should be located at the exact same URL, 
but will have different HTTP-verbs.
"""


@app.get("/listings")
def read_listings(
    q: Optional[str] = None,
    property_type: Optional[str] = None,
    rooms_min: Optional[int] = None,
    rooms_max: Optional[int] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    sort: Optional[str] = "newest",
    include_all_statuses: bool = False,
    con=Depends(get_db),
):
    listings = get_listings_full(
        con,
        q=q,
        property_type=property_type,
        rooms_min=rooms_min,
        rooms_max=rooms_max,
        price_min=price_min,
        price_max=price_max,
        sort=sort or "newest",
        only_for_sale=not include_all_statuses,
    )
    return {"listings": listings}


@app.get("/listings/{id}")
def read_one_listing(id: int, con=Depends(get_db)):
    listing = get_one_listing_full(con, id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@app.post("/listings")
def add_listing(listing: ListingCreate, con=Depends(get_db)):
    # We take the data from the "listing" variable (the Schema)
    new_id = create_listing(
        con,
        listing.title,
        listing.description,
        listing.price,
        listing.living_area,
        listing.lot_size,
        listing.room_count,
        listing.bathroom_count,
        listing.year_built,
        listing.floor_number,
        listing.energy_class,
        listing.renovation_year,
        listing.address_id,
        listing.property_type_id,
        listing.realtor_id,
        listing.status_id,
    )

    con.commit()
    return {"message": "Listing created successfully", "id": new_id}


@app.delete("/listings/{id}")
def remove_listing(id: int, con=Depends(get_db)):
    deleted_id = delete_listing(con, id)
    con.commit()

    if deleted_id is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"message": "Listing deleted successfully"}


@app.put("/listings/{id}")
def change_listing(id: int, listing: ListingCreate, con=Depends(get_db)):
    updated_row = update_listing(
        con,
        id,
        listing.title,
        listing.description,
        listing.price,
        listing.living_area,
        listing.lot_size,
        listing.room_count,
        listing.bathroom_count,
        listing.year_built,
        listing.floor_number,
        listing.energy_class,
        listing.renovation_year,
        listing.address_id,
        listing.property_type_id,
        listing.realtor_id,
        listing.status_id,
    )

    con.commit()

    if updated_row is None:
        raise HTTPException(status_code=404, detail="Listing not found.")
    return {"message": "Listing updated successfully!"}


# USER


@app.get("/users")
def read_users(con=Depends(get_db)):
    users = get_all_users(con)
    return {"users": [user_without_password(u) for u in users]}


@app.post("/users")
def add_user(user: UserCreate, con=Depends(get_db)):
    new_id = create_user(
        con,
        user.first_name,
        user.surname,
        user.mail,
        hash_password(user.password),
        user.phone_number,
        user.birthdate,
        user.role_id,
        user.address_id,
        user.company_id,
    )
    con.commit()
    return {"message": "User created successfully", "id": new_id}


@app.get("/users/{id}")
def read_one_user(id: int, con=Depends(get_db)):
    user = get_one_user(con, id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user_without_password(user)


@app.delete("/users/{id}")
def remove_user(id: int, con=Depends(get_db)):
    deleted_id = delete_user(con, id)
    con.commit()
    if deleted_id is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}


@app.put("/users/{id}")
def change_user(id: int, user: UserCreate, con=Depends(get_db)):
    updated_row = update_user(
        con,
        id,
        user.first_name,
        user.surname,
        user.mail,
        hash_password(user.password),
        user.phone_number,
        user.birthdate,
        user.role_id,
        user.address_id,
        user.company_id,
    )
    con.commit()
    if updated_row is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User updated successfully"}


# COMPANIES ENDPOINTS


@app.get("/companies")
def read_companies(con=Depends(get_db)):
    companies = get_all_companies(con)
    return {"companies": companies}


@app.get("/companies/{id}")
def read_one_company(id: int, con=Depends(get_db)):
    company = get_one_company(con, id)
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@app.post("/companies")
def add_company(company: CompanyCreate, con=Depends(get_db)):
    new_id = create_company(con, company.name, company.address_id)
    con.commit()
    return {"message": "Company created successfully", "id": new_id}


@app.delete("/companies/{id}")
def remove_company(id: int, con=Depends(get_db)):
    deleted_id = delete_company(con, id)
    con.commit()
    if deleted_id is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"message": "Company deleted successfully"}


@app.put("/companies/{id}")
def change_company(id: int, company: CompanyCreate, con=Depends(get_db)):
    updated_id = update_company(con, id, company.name, company.address_id)
    con.commit()
    if updated_id is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"message": "Company updated successfully"}


# ADDRESSES ENDPOINTS


@app.get("/addresses")
def read_addresses(con=Depends(get_db)):
    addresses = get_all_addresses(con)
    return {"addresses": addresses}


@app.get("/addresses/{id}")
def read_one_address(id: int, con=Depends(get_db)):
    address = get_one_address(con, id)
    if address is None:
        raise HTTPException(status_code=404, detail="Address not found")
    return address


@app.post("/addresses")
def add_address(address: AddressCreate, con=Depends(get_db)):
    new_id = create_address(
        con, address.street, address.city, address.postcode, address.country
    )
    con.commit()
    return {"message": "Address created successfully", "id": new_id}


@app.delete("/addresses/{id}")
def remove_address(id: int, con=Depends(get_db)):
    deleted_id = delete_address(con, id)
    con.commit()
    if deleted_id is None:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"message": "Address deleted successfully"}


@app.put("/addresses/{id}")
def change_address(id: int, address: AddressCreate, con=Depends(get_db)):
    updated_id = update_address(
        con, id, address.street, address.city, address.postcode, address.country
    )
    con.commit()
    if updated_id is None:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"message": "Address updated successfully"}


# FEATURE ENDPOINTS


@app.get("/features")
def read_features(con=Depends(get_db)):
    features = get_all_features(con)
    return {"features": features}


@app.get("/features/{id}")
def read_one_feature(id: int, con=Depends(get_db)):
    feature = get_one_feature(con, id)
    if feature is None:
        raise HTTPException(status_code=404, detail="Feature not found")
    return feature


@app.post("/features")
def add_feature(feature: FeatureCreate, con=Depends(get_db)):
    new_id = create_feature(con, feature.name)
    con.commit()
    return {"message": "Feature created successfully", "id": new_id}


@app.delete("/features/{id}")
def remove_feature(id: int, con=Depends(get_db)):
    deleted_id = delete_feature(con, id)
    con.commit()
    if deleted_id is None:
        raise HTTPException(status_code=404, detail="Feature not found")
    return {"message": "Feature deleted successfully"}


@app.put("/features/{id}")
def change_feature(id: int, feature: FeatureCreate, con=Depends(get_db)):
    updated_id = update_feature(con, id, feature.name)
    con.commit()
    if updated_id is None:
        raise HTTPException(status_code=404, detail="Feature not found")
    return {"message": "Feature updated successfully"}


# PATCH LISTINGS


@app.patch("/listings/{id}/price")
def update_price(id: int, update: ListingPriceUpdate, con=Depends(get_db)):
    updated_id = update_listing_price(con, id, update.price)
    con.commit()

    if updated_id is None:
        raise HTTPException(status_code=404, detail="Listing not found")

    return {"message": "Price updated successfully"}


@app.patch("/listings/{id}/status")
def update_status(id: int, update: ListingStatusUpdate, con=Depends(get_db)):
    updated_id = update_listing_status(con, id, update.status_id)
    con.commit()

    if updated_id is None:
        raise HTTPException(status_code=404, detail="Listing not found")

    return {"message": "Status updated successfully"}


# MESSAGE LISTINGS


@app.post("/messages")
def add_message(
    payload: MessageCreate,
    credentials: HTTPBasicCredentials = Depends(security),
    con=Depends(get_db),
):
    sender = authenticate_user(con, credentials)
    msg = create_message(
        con,
        sender["id"],
        payload.receiver_id,
        payload.listing_id,
        payload.content,
    )
    con.commit()
    return msg


@app.get("/messages/listing/{listing_id}")
def list_messages_for_listing(listing_id: int, con=Depends(get_db)):
    return get_messages_for_listing(con, listing_id)


@app.get("/messages/user/{user_id}")
def list_messages_for_user(user_id: int, con=Depends(get_db)):
    return get_messages_for_user(con, user_id)
