using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Game : MonoBehaviour
{
    [SerializeField] private GameObject prefab = null;

    private const int div = 16;
    private GameObject core = null;
    private GameObject[] bodies = new GameObject[div];
    private SpringJoint2D[] arounds = new SpringJoint2D[div];
    private SpringJoint2D[] arounds2 = new SpringJoint2D[div];
    private SpringJoint2D[] diagonal = new SpringJoint2D[div];
    private SpringJoint2D[] radial = new SpringJoint2D[div];
    private bool pressed = false;
    private Vector2 mousePos = Vector2.zero;
    private Vector2 mouseOrigin = Vector2.zero;

    private void Start()
    {
        core = Instantiate(prefab);
        for (int i = 0; i < div; i++)
        {
            float r = (Mathf.PI * 2) / div * i;
            bodies[i] = Instantiate(prefab, new Vector3(Mathf.Cos(r) * 0.3f, Mathf.Sin(r) * 0.3f), Quaternion.identity);
        }

        for (int i = 0; i < div; i++)
        {
            arounds[i] = bodies[i].AddComponent<SpringJoint2D>();
            arounds[i].connectedBody = bodies[(i + 1)  % div].GetComponent<Rigidbody2D>();
            arounds[i].frequency = 10.0f;

            arounds2[i] = bodies[i].AddComponent<SpringJoint2D>();
            arounds2[i].connectedBody = bodies[(i + 2) % div].GetComponent<Rigidbody2D>();
            arounds2[i].frequency = 10.0f;

            diagonal[i] = bodies[i].AddComponent<SpringJoint2D>();
            diagonal[i].connectedBody = bodies[(i + div / 2) % div].GetComponent<Rigidbody2D>();
            diagonal[i].frequency = 5.0f;

            radial[i] = bodies[i].AddComponent<SpringJoint2D>();
            radial[i].connectedBody = core.GetComponent<Rigidbody2D>();
            radial[i].frequency = 5.0f;
        }
    }

    private void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            pressed = true;
            mouseOrigin = Input.mousePosition;
        }

        if (Input.GetMouseButtonUp(0))
        {
            pressed = false;
        }

        float length = 0f;

        if (pressed)
        {
            mousePos = Input.mousePosition;
            length = Mathf.Sqrt(Mathf.Pow(mouseOrigin.x - mousePos.x, 2f) + Mathf.Pow(mouseOrigin.y - mousePos.y, 2f)) * 0.005f;
        }

        if (length > 1.5f)
        {
            length = 1.5f;
        }

        for (int i = 0; i < div; i++)
        {
            float r = (Mathf.PI * 2f) / div * i;
            float v = Mathf.Cos(r) * (0.3f + length);
            float h = Mathf.Sin(r) * 0.3f;

            r = (Mathf.PI * 2f) / div * ((i + 1) % div);
            float v2 = Mathf.Cos(r) * (0.3f + length);
            float h2 = Mathf.Sin(r) * 0.3f;

            r = (Mathf.PI * 2f) / div * ((i + 2) % div);
            float v3 = Mathf.Cos(r) * (0.3f + length);
            float h3 = Mathf.Sin(r) * 0.3f;

            r = (Mathf.PI * 2f) / div * ((i + div / 2) % div);
            float v4 = Mathf.Cos(r) * (0.3f + length);
            float h4 = Mathf.Sin(r) * 0.3f;

            arounds[i].distance = Mathf.Sqrt(Mathf.Pow(v - v2, 2) + Mathf.Pow(h - h2, 2));
            arounds2[i].distance = Mathf.Sqrt(Mathf.Pow(v - v3, 2) + Mathf.Pow(h - h3, 2));
            diagonal[i].distance = Mathf.Sqrt(Mathf.Pow(v - v4, 2) + Mathf.Pow(h - h4, 2));
            radial[i].distance = Mathf.Sqrt(Mathf.Pow(v, 2) + Mathf.Pow(h, 2));
        }
    }
}
