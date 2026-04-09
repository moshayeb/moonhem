"""Listings query params are forwarded to get_listings_full."""

from __future__ import annotations

from unittest.mock import patch


@patch("backend.app.get_listings_full")
def test_listings_forwards_filters(mock_glf, client, mock_con):
    mock_glf.return_value = []
    res = client.get(
        "/listings",
        params={
            "q": "Stockholm",
            "property_type": "apartment",
            "rooms_min": 2,
            "rooms_max": 5,
            "price_min": 1_000_000,
            "price_max": 5_000_000,
            "sort": "price_asc",
            "include_all_statuses": "true",
        },
    )
    assert res.status_code == 200
    assert res.json() == {"listings": []}
    mock_glf.assert_called_once()
    args, kwargs = mock_glf.call_args
    assert args[0] is mock_con
    assert kwargs == {
        "q": "Stockholm",
        "property_type": "apartment",
        "rooms_min": 2,
        "rooms_max": 5,
        "price_min": 1_000_000.0,
        "price_max": 5_000_000.0,
        "sort": "price_asc",
        "only_for_sale": False,
    }


@patch("backend.app.get_listings_full")
def test_listings_default_for_sale_only(mock_glf, client, mock_con):
    mock_glf.return_value = []
    res = client.get("/listings")
    assert res.status_code == 200
    _, kwargs = mock_glf.call_args
    assert kwargs["only_for_sale"] is True
